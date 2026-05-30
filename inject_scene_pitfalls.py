#!/usr/bin/env python3
"""
为 calculators.js 中每个公式注入 scene 和 pitfalls 字段。
在 example: {...} 之前插入 scene 和 pitfalls。
"""
import re, json

SCENE_PITFALLS = {
    'survey_drilling': {
        'scene': '勘察阶段估算钻探工作量，编制勘察方案与预算',
        'pitfalls': ['勘探点密度 n 需按规范等级选取，不同场地类别取值不同', '回次效率 η 实际取值 0.8~0.9，不可取 1']
    },
    'principle_load_combo': {
        'scene': '地基承载力验算、基础底面积计算时确定荷载效应',
        'pitfalls': ['地基承载力验算必须用标准组合，不能用基本组合', 'ψ 组合值系数不同可变荷载取值不同，楼面活荷载 ψ=0.7，风荷载 ψ=0.6']
    },
    'principle_settlement': {
        'scene': '初步估算地基沉降量，判断是否满足变形控制要求',
        'pitfalls': ['Es 单位是 MPa，p0 单位是 kPa，单位换算最容易错', '实际工程需分层计算后求和，单层只是简化']
    },
    'bearing_full': {
        'scene': '最核心公式！几乎所有浅基础题目第一步都是承载力修正',
        'pitfalls': ['b≤3m 时宽度修正项为 0，不是用 (b-3) 得负数', 'ηb、ηd 查表值取决于土的类别（黏性土/砂土/碎石土），查错表直接全错', '地下水位以下 γ 用浮重度 γ\'=γsat-10']
    },
    'bearing_depth': {
        'scene': '换填垫层、搅拌桩等地基处理后承载力修正（ηb=0）',
        'pitfalls': ['换填垫层 ηb=0、ηd=1.0，不是用原土的 η 值', '压实填土 ηd 取值与压实系数和黏粒含量有关，需分情况']
    },
    'bearing_weak': {
        'scene': '基础底下有软弱土层时必须验算，高频考点',
        'pitfalls': ['pz 是附加应力不是总应力，需先算 pz 再算 pcz', 'faz 也需要做深度修正，不能直接用 fak']
    },
    'bearing_area': {
        'scene': '已知上部荷载反求基础底面积，基础设计第一步',
        'pitfalls': ['分母 fa-γG·d 可能≤0，说明承载力不足需调整', '算出 A 后还需考虑偏心、抗浮等，A 只是最小值']
    },
    'bearing_ec2': {
        'scene': '偏心荷载下基底压力分布验算，判断是否出现拉应力',
        'pitfalls': ['pmin<0 说明基底出现拉区，需增大基础尺寸', 'W 是截面模量，矩形基础 W=b·l²/6，别和面积搞混']
    },
    'bearing_spread': {
        'scene': '软弱下卧层验算中求附加应力 pz（角点法/中心点法）',
        'pitfalls': ['矩形基础中心点用 4 倍角点法，角点用 1 倍', 'α̅ 查表时 l/b 和 z/l 的比值容易搞反']
    },
    'bearing_eccentric': {
        'scene': '偏心荷载验算，判断偏心距是否在核心范围内',
        'pitfalls': ['e>b/6 时基底出现拉应力区，pmin<0', 'Gk 不能漏算（基础自重+回填土重）']
    },
    'bearing_settle_ec2': {
        'scene': '规范法计算地基最终沉降量，分层求和后乘以 ψs',
        'pitfalls': ['Es 单位 MPa 需换算为 kPa（×1000）', 'ψs 按平均压力与 Es 查表，不同土性取值不同', 'zᵢα̅ᵢ 是累积值，不是单层值']
    },
    'pile_ra': {
        'scene': '桩基设计核心公式，由地质参数求单桩承载力',
        'pitfalls': ['安全系数 2 不能忘（Ra=Quk/2）', 'up=π·d，桩径 d 单位是 m 不是 mm', 'qsik、qpk 查表值与桩型（预制/灌注）有关']
    },
    'pile_quk': {
        'scene': '求单桩极限承载力标准值，不除以安全系数',
        'pitfalls': ['与 Ra 的区别：Quk 不除以 2', '多土层需分层求和 Σ(qsik·li)', '端阻力 qpk 只在桩端土层取值']
    },
    'pile_group_eff': {
        'scene': '群桩效应分析，判断群桩承载力折减程度',
        'pitfalls': ['ηg 通常<1（摩擦桩），端承桩 ηg 可>1', 'ηg>1.2 说明数据可能有误']
    },
    'pile_settlement': {
        'scene': '估算桩基沉降，判断是否满足变形控制',
        'pitfalls': ['ψ 是经验系数，按桩型查表', 'Es 取桩端以下压缩层范围内的加权平均值']
    },
    'pile_neg_friction': {
        'scene': '填土地基、抽水降水位等情况下桩产生负摩阻力',
        'pitfalls': ['负摩阻力是"向下拉"的力，增大桩的轴向荷载', '中性点以上有负摩阻力，以下有正摩阻力', 'ψn 折减系数按桩型查表']
    },
    'pile_horiz': {
        'scene': '桩承受水平荷载（如桥桩）时的承载力',
        'pitfalls': ['α 是桩的水平变形系数，与 EpIp/E0 有关', 'b₀ 是桩的计算宽度，与桩径和埋深有关']
    },
    'pile_group_bearing': {
        'scene': '群桩基础总承载力计算，取单桩总和与群效应的小值',
        'pitfalls': ['摩擦桩群 ηg<1，取 ηg·n·Ra', '端承桩群 ηg≈1，取 n·Ra', '必须比较后取小值']
    },
    'pile_check_base': {
        'scene': '桩基承台下持力层承载力验算',
        'pitfalls': ['A 是承台底面积，不是桩截面积之和', 'Gk 包括承台自重和承台上土重', 'fa 是承台底面处土的承载力（需深度修正）']
    },
    'treat_replace_fa': {
        'scene': '换填垫层处理后承载力修正',
        'pitfalls': ['ηb=0、ηd=1.0 是固定值，与换填材料无关', '大面积压实填土 ηd 取值与压实系数和黏粒含量有关']
    },
    'treat_composite_fa': {
        'scene': '复合地基承载力计算，最核心公式，每年必考',
        'pitfalls': ['Ra 是单桩竖向承载力特征值（已除以 2），不是极限值', 'β 是桩间土承载力折减系数，按规范查表', 'm 是面积置换率，先算 m 再算 fspk']
    },
    'treat_replace_m': {
        'scene': '计算面积置换率，是复合地基计算的前置步骤',
        'pitfalls': ['de：正方形布桩 de=1.13s，等边三角形 de=1.05s', 'm 通常 0.05~0.35，超出范围需检查']
    },
    'treat_prelod_settle': {
        'scene': '预压法处理软土地基的工后沉降估算',
        'pitfalls': ['a/(1+e0) 是压缩指数 Cs', 'lg 是以 10 为底的对数，不是自然对数 ln', 'p0 是自重应力，pz 是预压荷载']
    },
    'treat_cement_mix': {
        'scene': '水泥土搅拌桩水泥用量计算，施工控制关键参数',
        'pitfalls': ['μc 是水泥掺量比（通常 15%~25%）', 'ρc 是水泥密度 1.9t/m³，不是水泥土密度']
    },
    'treat_sand_pile_s': {
        'scene': '砂石桩/振冲桩设计时确定桩间距',
        'pitfalls': ['等边三角形布桩系数 √(√3/π)≈0.742', '正方形布桩系数不同，需区分', 's 算出后需圆整到 50mm 的倍数']
    },
    'treat_compact_density': {
        'scene': '灰土挤密桩/土挤密桩处理后桩土共同干密度',
        'pitfalls': ['ρd1 是桩体干密度，ρd2 是桩间土挤密后干密度', '处理后干密度需≥压实系数×最大干密度']
    },
    'treat_replace_thickness': {
        'scene': '换填垫层底面宽度计算，用于下卧层验算的应力扩散',
        'pitfalls': ['θ 是垫层应力扩散角：砂石 θ=30°，粉质黏土 θ=20°~25°', 'z 是垫层厚度不是基础埋深', 'bz 用于计算下卧层顶面附加应力']
    },
    'slope_infinite': {
        'scene': '均质无限长边坡稳定性快速估算',
        'pitfalls': ['角度必须转为弧度计算（×π/180）', '纯摩擦土坡 c=0，公式简化为 Ks=cotβ·tanφ', '地下水位以下用浮重度 γ\'']
    },
    'slope_taylor': {
        'scene': '均质黏性土坡稳定性快速判断（查 Taylor 图）',
        'pitfalls': ['m 算出后需查 Taylor 稳定数图确定临界坡角', 'Fs 是目标安全系数，设计时通常取 1.3']
    },
    'slope_active': {
        'scene': '挡土墙/边坡主动土压力计算，最基础公式',
        'pitfalls': ['Ka=tan²(45°-φ/2)，φ 取有效内摩擦角', '有地下水时需另算静水压力，叠加', '墙后有超载 q 时：Ea=0.5γH²Ka+qH·Ka']
    },
    'slope_anchor': {
        'scene': '锚杆挡墙设计中求单根锚杆轴向拉力',
        'pitfalls': ['Sa、Sh 是锚杆水平和竖向间距', '实际设计还需除以 cosα（锚杆倾角）和材料强度']
    },
    'slope_gravity_wall': {
        'scene': '重力式挡墙抗滑移稳定性验算',
        'pitfalls': ['μ 是挡墙基底与地基土的摩擦系数，查表', 'Kc≥1.3 是规范要求', '∑G 包括挡墙自重+墙背填土重']
    },
    'slope_overturn': {
        'scene': '重力式挡墙抗倾覆稳定性验算',
        'pitfalls': ['Ko≥1.6 是规范要求（比抗滑移更严格）', 'MR、MO 都绕墙趾计算', '力矩臂容易算错，需仔细看图']
    },
    'slope_passive': {
        'scene': '挡墙前被动土压力（地基抗力）计算',
        'pitfalls': ['Kp=1/Ka=tan²(45°+φ/2)', '黏聚力项 2c√Kpc 不可忽略', '被动土压力通常远大于主动土压力']
    },
    'slope_water_press': {
        'scene': '水位以下边坡/挡墙的静水压力计算',
        'pitfalls': ['γw=10kN/m³', 'hw 是水头高度（水面到计算点的垂直距离）', '土压力和静水压力需分别计算后叠加']
    },
    'excav_atc': {
        'scene': '基坑排桩/地连墙主动土压力计算（分层计算）',
        'pitfalls': ['Kaγ 和 Kac 可能不同（规范推荐值）', '每层土需分别计算后叠加', '黏聚力项是减项，c 越大土压力越小']
    },
    'excav_water_press': {
        'scene': '基坑渗流作用下渗透力计算',
        'pitfalls': ['水力梯度 i=hw/L，hw 是水头差', '渗透力方向与渗流方向一致（向上或向下）', 'γw=10kN/m³']
    },
    'excav_heave': {
        'scene': '基坑底部抗隆起稳定性验算（软土地基关键）',
        'pitfalls': ['Nc、Nq 是承载力系数，与 φ 有关需查表', 'Fs≥1.2 是 JGJ 120 要求', 'Df 是坑底以下加固深度或嵌固深度']
    },
    'excav_anchor_len': {
        'scene': '锚杆锚固段长度设计',
        'pitfalls': ['[σ] 是锚固体与土体的粘结强度设计值，单位 MPa 需×1000 转 kPa', 'η 是锚杆工作条件系数', 'df 是锚固体直径（不是钢筋直径）']
    },
    'excav_pile_moment': {
        'scene': '排桩最大弯矩简化估算',
        'pitfalls': ['这是简支梁简化，实际是超静定结构', 'q 是等效均布荷载（土压力合力/高度）', '实际设计需用 m 法或有限元']
    },
    'special_collapse': {
        'scene': '湿陷性黄土地区湿陷量计算',
        'pitfalls': ['δzi 是湿陷系数，由试验测定', 'Hi 单位是 mm 不是 m', '多层需累加，总湿陷量≥150mm 为湿陷性黄土']
    },
    'special_swell': {
        'scene': '膨胀土地区膨胀力估算（教学参考）',
        'pitfalls': ['此为简化经验公式，非规范标准公式', '实际膨胀力由室内试验测定', '含水量对膨胀力影响很大']
    },
    'special_soft_soil': {
        'scene': '软土判定（教学参考）',
        'pitfalls': ['液限 wL 实际由 Casagrande 试验测定，非计算值', '软土判定还需满足 e≥1.0 且饱和', '此为简化估算，仅供参考']
    },
    'special_rock_fall': {
        'scene': '危岩体平面滑动稳定性分析',
        'pitfalls': ['W 是危岩体自重（需先算体积×重度）', 'α 是滑动面倾角，φ 是滑动面摩擦角', 'c、φ 是滑动面参数，不是岩体参数']
    },
    'seismic_liquefaction': {
        'scene': '砂土液化判别，抗震设计必做',
        'pitfalls': ['Ncr 修正公式中 ρc 是黏粒含量（%）', 'dw 是地下水位深度，db 是判别深度', 'N<Ncr 判定为液化，N≥Ncr 不液化']
    },
    'seismic_bearing_adj': {
        'scene': '抗震设防时地基承载力可提高 ζa 倍',
        'pitfalls': ['ζa 按抗震设防烈度查表：7度=1.1, 8度=1.2, 9度=1.3', '仅适用于抗震验算，正常设计不能用 ζa']
    },
    'seismic_liquefaction_idx': {
        'scene': '计算场地液化指数，划分液化等级',
        'pitfalls': ['Ni≥Ncri 的层不参与计算（该项为 0）', 'Wil 是权重函数，与深度有关（越深权重越小）', 'IlE≤6 轻微，6~15 中等，>15 严重']
    },
    'seismic_spectra_accel': {
        'scene': '地震影响系数曲线计算，抗震设计核心参数',
        'pitfalls': ['T≤Tg 时 α=η₂·αmax（水平段）', 'T>Tg 时 α 按衰减段公式计算', 'ν 衰减指数通常取 0.9']
    },
    'seismic_base_shear': {
        'scene': '底部剪力法求结构总地震作用',
        'pitfalls': ['Geq=0.85G（多质点）或 0.75G（单质点）', '仅适用于高度≤40m 的规则结构', 'α₁ 按 T 和 Tg 从反应谱查得']
    },
    'monitor_static_load': {
        'scene': '平板载荷试验确定地基承载力特征值',
        'pitfalls': ['Qcr 是比例界限荷载（p-s 曲线直线段终点）', '除 3 是安全系数，不能忘', 'A 是承压板面积（方形板 0.25m² 或 0.5m²）']
    },
    'monitor_pile_wave': {
        'scene': '低应变反射波法检测桩长或桩身缺陷',
        'pitfalls': ['t 单位是 ms，需除以 1000 转为 s', 'c 是桩身波速（混凝土桩约 3500~4500m/s）', '除以 2 是因为波往返一次']
    },
    'monitor_compaction': {
        'scene': '压实填土地基质量检验',
        'pitfalls': ['λc≥0.95（0~800mm）或≥0.97（800mm 以下）', 'ρd,max 由 Proctor 击实试验测定', '不同压实度要求对应不同深度范围']
    },
    'monitor_dynamic_pen': {
        'scene': '动力触探试验判定土的密实度',
        'pitfalls': ['N63.5 是 63.5kg 重锤、76cm 落距的锤击数', '需做杆长修正（钻杆过长需修正）', '不同土类判定标准不同（砂土/粉土/黏性土）']
    },
}

# Read the file
with open('calculators.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Find each formula block and inject scene/pitfalls before "example:"
count = 0
for fid, data in SCENE_PITFALLS.items():
    # Find the formula block by id, then find "example:" after it
    # Pattern: find 'id: \'xxx\'' then find next 'example:'
    pattern = rf"(id: '{re.escape(fid)}'.*?)(example:)"
    match = re.search(pattern, content, re.DOTALL)
    if not match:
        print(f"WARNING: Could not find formula id '{fid}'")
        continue

    # Build JS code for scene and pitfalls
    scene_js = json.dumps(data['scene'], ensure_ascii=False)
    pitfalls_js = json.dumps(data['pitfalls'], ensure_ascii=False)

    injection = f"        scene: {scene_js},\n        pitfalls: {pitfalls_js},\n        "

    content = content[:match.start(2)] + injection + content[match.start(2):]
    count += 1
    print(f"Injected: {fid}")

with open('calculators.js', 'w', encoding='utf-8') as f:
    f.write(content)

print(f"\nDone! Injected scene/pitfalls for {count} formulas.")
