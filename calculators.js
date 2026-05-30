// ============================================================
// 岩土注册工程师考试 - 公式计算器数据
// 覆盖 10 章核心考点公式，共 87 个公式
// ============================================================

const CALC_CATEGORIES = [
  // ===================== 第一章 岩土工程勘察 =====================
  {
    id: 'survey', name: '第一章 勘察',
    formulas: [
      {
        id: 'survey_drilling',
        name: '钻探工作量估算',
        expr: 'Q = \\frac{A \\cdot n}{S \\cdot \\eta}',
        note: 'A=勘察面积, n=勘探点密度, S=单孔进尺, η=回次效率',
        params: [
          { key: 'A', label: 'A', unit: 'm²', default: 10000 },
          { key: 'n', label: 'n', unit: '个/万m²', default: 5 },
          { key: 'S', label: 'S', unit: 'm', default: 30 },
          { key: 'eta', label: 'η', unit: '', default: 0.85 }
        ],
        scene: "勘察阶段估算钻探工作量，编制勘察方案与预算",
        pitfalls: ["勘探点密度 n 需按规范等级选取，不同场地类别取值不同", "回次效率 η 实际取值 0.8~0.9，不可取 1"],
        example: { A: 10000, n: 5, S: 30, eta: 0.85 },
        calc: (p) => {
          const r = (p.A * p.n) / (p.S * p.eta);
          return { value: r.toFixed(1), unit: '个', isValid: r > 0,
            steps: [
              { desc: '勘探点数', latex: `N = \\frac{${p.A}}{10000} \\times ${p.n} = ${(p.A/10000*p.n).toFixed(1)} \\text{ 个}` },
              { desc: '总钻探工作量', latex: `Q = \\frac{${p.A} \\times ${p.n}}{${p.S} \\times ${p.eta}} = ${r.toFixed(1)} \\text{ 个}` }
            ]
          };
        }
      },
      {
        id: 'survey三相指标',
        name: '土的三相指标换算',
        expr: 'e = \\frac{G_s \\cdot w}{S_r},\\quad \\rho_d = \\frac{\\rho}{1+w},\\quad S_r = \\frac{w \\cdot G_s}{e}',
        note: 'GB 50021-2001(2009)，已知 ρs、ρ、w 求 e、Sr、ρd、γ 等',
        params: [
          { key: 'Gs', label: 'G<sub>s</sub>', unit: 'g/cm³', default: 2.70 },
          { key: 'rho', label: 'ρ', unit: 'g/cm³', default: 1.85 },
          { key: 'w', label: 'w', unit: '%', default: 25 }
        ],
        scene: "已知土粒密度、天然密度和含水率，求孔隙比、饱和度、干密度等核心指标",
        pitfalls: ["含水率 w 输入时用百分数（如 25），计算时需除以 100", "Gs 一般黏性土 2.70~2.75，砂土 2.65~2.69", "饱和度 Sr>100% 说明数据有误"],
        example: { Gs: 2.70, rho: 1.85, w: 25 },
        calc: (p) => {
          const wDec = p.w / 100;
          const rho_d = p.rho / (1 + wDec);
          const e = (p.Gs / rho_d) - 1;
          const Sr = (wDec * p.Gs / e) * 100;
          const gamma = p.rho * 9.8 / 10;
          return { value: `e=${e.toFixed(3)}`, unit: `Sr=${Sr.toFixed(1)}%, ρd=${rho_d.toFixed(3)}g/cm³`, isValid: Sr >= 0 && Sr <= 100 && e > 0,
            steps: [
              { desc: '干密度', latex: `\\rho_d = \\frac{\\rho}{1+w} = \\frac{${p.rho}}{1+${wDec.toFixed(3)}} = ${rho_d.toFixed(4)} \\text{ g/cm}^3` },
              { desc: '孔隙比', latex: `e = \\frac{G_s}{\\rho_d} - 1 = \\frac{${p.Gs}}{${rho_d.toFixed(4)}} - 1 = ${e.toFixed(4)}` },
              { desc: '饱和度', latex: `S_r = \\frac{w \\cdot G_s}{e} = \\frac{${wDec.toFixed(3)} \\times ${p.Gs}}{${e.toFixed(4)}} = ${(Sr/100).toFixed(4)} = ${Sr.toFixed(1)}\\%` },
              { desc: '天然重度', latex: `\\gamma = \\rho \\cdot g \\approx ${gamma.toFixed(1)} \\text{ kN/m}^3` }
            ]
          };
        }
      },
      {
        id: 'survey_ip_il',
        name: '塑性指数 Ip / 液性指数 IL',
        expr: 'I_p = w_L - w_P,\\quad I_L = \\frac{w - w_P}{I_p}',
        note: 'GB 50021-2001(2009)，黏性土分类与稠度状态判定',
        params: [
          { key: 'wL', label: 'w<sub>L</sub>', unit: '%', default: 42 },
          { key: 'wP', label: 'w<sub>P</sub>', unit: '%', default: 22 },
          { key: 'w', label: 'w', unit: '%', default: 28 }
        ],
        scene: "黏性土分类（粉质黏土/黏土）和稠度状态判定（坚硬/硬塑/可塑/软塑/流塑）",
        pitfalls: ["Ip>17 为黏土，Ip≤17 为粉质黏土", "IL<0 坚硬，0~0.25 硬塑，0.25~0.75 可塑，0.75~1.0 软塑，>1.0 流塑", "wL、wP 由 Casagrande 试验测定"],
        example: { wL: 42, wP: 22, w: 28 },
        calc: (p) => {
          const Ip = p.wL - p.wP;
          const IL = Ip > 0 ? (p.w - p.wP) / Ip : 0;
          const soilType = Ip > 17 ? '黏土' : '粉质黏土';
          let consistency = IL < 0 ? '坚硬' : IL <= 0.25 ? '硬塑' : IL <= 0.75 ? '可塑' : IL <= 1.0 ? '软塑' : '流塑';
          return { value: Ip.toFixed(1), unit: `IL=${IL.toFixed(3)}`, isValid: Ip > 0,
            steps: [
              { desc: '塑性指数', latex: `I_p = w_L - w_P = ${p.wL} - ${p.wP} = ${Ip.toFixed(1)}` },
              { desc: '土类判定', latex: `I_p = ${Ip.toFixed(1)} ${Ip > 17 ? '> 17 \\rightarrow \\text{黏土}' : '\\leq 17 \\rightarrow \\text{粉质黏土}'}` },
              { desc: '液性指数', latex: `I_L = \\frac{w - w_P}{I_p} = \\frac{${p.w} - ${p.wP}}{${Ip.toFixed(1)}} = ${IL.toFixed(3)}` },
              { desc: '稠度状态', latex: `I_L = ${IL.toFixed(3)} \\rightarrow \\text{${consistency}}` }
            ]
          };
        }
      },
      {
        id: 'survey_dr',
        name: '砂土相对密实度 Dr',
        expr: 'D_r = \\frac{e_{max} - e}{e_{max} - e_{min}}',
        note: 'GB 50021-2001(2009)，砂土密实度判定',
        params: [
          { key: 'emax', label: 'e<sub>max</sub>', unit: '', default: 0.85 },
          { key: 'emin', label: 'e<sub>min</sub>', unit: '', default: 0.55 },
          { key: 'e', label: 'e', unit: '', default: 0.65 }
        ],
        scene: "砂土密实度判定（松散/中密/密实）",
        pitfalls: ["Dr<0.33 松散，0.33~0.67 中密，>0.67 密实", "emax、emin 由试验测定，不可估算", "e 必须在 emin 和 emax 之间"],
        example: { emax: 0.85, emin: 0.55, e: 0.65 },
        calc: (p) => {
          const Dr = (p.emax - p.e) / (p.emax - p.emin);
          const density = Dr < 0.33 ? '松散' : Dr <= 0.67 ? '中密' : '密实';
          return { value: Dr.toFixed(3), unit: `${(Dr*100).toFixed(1)}%（${density}）`, isValid: Dr >= 0 && Dr <= 1,
            steps: [
              { desc: '最大最小孔隙比', latex: `e_{max} = ${p.emax}, \\quad e_{min} = ${p.emin}` },
              { desc: '天然孔隙比', latex: `e = ${p.e}` },
              { desc: '相对密实度', latex: `D_r = \\frac{${p.emax} - ${p.e}}{${p.emax} - ${p.emin}} = ${Dr.toFixed(3)}` },
              { desc: '密实度判定', latex: `D_r = ${Dr.toFixed(3)} \\rightarrow \\text{${density}}` }
            ]
          };
        }
      },
      {
        id: 'survey_darcy',
        name: '达西定律渗透系数',
        expr: 'v = k \\cdot i = k \\cdot \\frac{h}{L}',
        note: 'SL 274-2001，达西渗流定律',
        params: [
          { key: 'k', label: 'k', unit: 'cm/s', default: 0.002 },
          { key: 'h', label: 'h', unit: 'cm', default: 50 },
          { key: 'L', label: 'L', unit: 'cm', default: 100 },
          { key: 'A', label: 'A', unit: 'cm²', default: 500 }
        ],
        scene: "达西定律计算渗流速度和渗流量",
        pitfalls: ["k 单位 cm/s，不同土类差异巨大（黏土 10⁻⁷~10⁻⁹，砂土 10⁻²~10⁻⁴）", "水力梯度 i=h/L 无量纲", "渗流量 Q=v·A"],
        example: { k: 0.002, h: 50, L: 100, A: 500 },
        calc: (p) => {
          const i = p.h / p.L;
          const v = p.k * i;
          const Q = v * p.A;
          return { value: v.toExponential(3), unit: `cm/s，Q=${Q.toExponential(3)}cm³/s`, isValid: v > 0,
            steps: [
              { desc: '水力梯度', latex: `i = \\frac{h}{L} = \\frac{${p.h}}{${p.L}} = ${i.toFixed(3)}` },
              { desc: '渗流速度', latex: `v = k \\cdot i = ${p.k} \\times ${i.toFixed(3)} = ${v.toExponential(3)} \\text{ cm/s}` },
              { desc: '渗流量', latex: `Q = v \\cdot A = ${v.toExponential(3)} \\times ${p.A} = ${Q.toExponential(3)} \\text{ cm}^3\\text{/s}` }
            ]
          };
        }
      },
      {
        id: 'survey_spt',
        name: '标准贯入试验 SPT 判定',
        expr: 'N_{63.5} \\text{ 判定砂土密实度}',
        note: 'GB/T 50123-2019，N<10 松散，10~30 中密，>30 密实',
        params: [
          { key: 'N', label: 'N<sub>63.5</sub>', unit: '击/30cm', default: 18 },
          { key: 'N_limit', label: 'N<sub>限值</sub>', unit: '击/30cm', default: 15 }
        ],
        scene: "标准贯入试验判定砂土密实度，最常用原位测试",
        pitfalls: ["N 需做杆长修正（钻杆>1.5m 时）", "砂土：N<10 松散，10~30 中密，>30 密实", "锤击数 N 是打入最后 30cm 的锤击数"],
        example: { N: 18, N_limit: 15 },
        calc: (p) => {
          const density = p.N < 10 ? '松散' : p.N <= 30 ? '中密' : '密实';
          const pass = p.N >= p.N_limit;
          return { value: p.N.toFixed(0), unit: '击/30cm（' + density + '）', isValid: pass,
            steps: [
              { desc: '实测标准贯入锤击数', latex: `N_{63.5} = ${p.N} \\text{ 击/30cm}` },
              { desc: '密实度判定', latex: `N = ${p.N} \\rightarrow \\text{${density}}` },
              { desc: '与限值比较', latex: `N = ${p.N} ${pass ? '\\geq' : '<'} ${p.N_limit}${pass ? '\\quad \\text{满足}' : '\\quad \\text{不满足}'}` }
            ]
          };
        }
      },
      {
        id: 'survey_cpt',
        name: '静力触探判定土类',
        expr: 'q_c \\text{ 和 } f_s \\text{ 判定土类}',
        note: 'JGJ 79-2012，qc=锥尖阻力，fs=侧壁摩阻力，Rf=摩阻比(%)',
        params: [
          { key: 'qc', label: 'q<sub>c</sub>', unit: 'MPa', default: 3.5 },
          { key: 'fs', label: 'f<sub>s</sub>', unit: 'kPa', default: 80 },
          { key: 'Rf', label: 'R<sub>f</sub>', unit: '%', default: 2.3 }
        ],
        scene: "静力触探（CPT）根据锥尖阻力和侧壁摩阻力判定土类",
        pitfalls: ["Rf=fs/qc×100%，黏性土 Rf>5%，砂土 Rf<2%", "qc 单位 MPa，fs 单位 kPa，注意单位换算", "需结合当地经验使用"],
        example: { qc: 3.5, fs: 80, Rf: 2.3 },
        calc: (p) => {
          const rfCalc = (p.fs / (p.qc * 1000)) * 100;
          const soilType = rfCalc > 5 ? '黏性土' : rfCalc > 2 ? '粉土' : '砂土';
          return { value: `${p.qc} / ${p.fs}`, unit: `MPa / kPa（${soilType}）`, isValid: p.qc > 0,
            steps: [
              { desc: '锥尖阻力', latex: `q_c = ${p.qc} \\text{ MPa}` },
              { desc: '侧壁摩阻力', latex: `f_s = ${p.fs} \\text{ kPa}` },
              { desc: '摩阻比', latex: `R_f = \\frac{f_s}{q_c} \\times 100\\% = \\frac{${p.fs}}{${p.qc} \\times 1000} \\times 100\\% = ${rfCalc.toFixed(1)}\\%` },
              { desc: '土类判定', latex: `R_f = ${rfCalc.toFixed(1)}\\% \\rightarrow \\text{${soilType}}` }
            ]
          };
        }
      },
      {
        id: 'survey_pressuremeter',
        name: '旁压试验模量',
        expr: 'E_0 = 2(1+\\mu)(A+B)\\frac{V_0+V/2}{V}',
        note: 'GB/T 50123-2019，简化：E₀≈2(1+μ)(A+B)·修正系数',
        params: [
          { key: 'mu', label: 'μ', unit: '', default: 0.35 },
          { key: 'A', label: 'A', unit: 'kPa', default: 80 },
          { key: 'B', label: 'B', unit: 'kPa', default: 120 },
          { key: 'V0', label: 'V₀', unit: 'mL', default: 95 },
          { key: 'V', label: 'V', unit: 'mL', default: 150 }
        ],
        scene: "旁压试验求原位变形模量 E₀",
        pitfalls: ["A 是初始压力，B 是旁压模量", "μ 是泊松比，黏性土 0.3~0.4，砂土 0.2~0.3", "V₀ 是旁压器初始体积，V 是试验体积增量"],
        example: { mu: 0.35, A: 80, B: 120, V0: 95, V: 150 },
        calc: (p) => {
          const corr = (p.V0 + p.V / 2) / p.V;
          const E0 = 2 * (1 + p.mu) * (p.A + p.B) * corr;
          return { value: E0.toFixed(1), unit: 'kPa', isValid: E0 > 0,
            steps: [
              { desc: '体积修正系数', latex: `\\frac{V_0 + V/2}{V} = \\frac{${p.V0} + ${p.V/2}}{${p.V}} = ${corr.toFixed(3)}` },
              { desc: '旁压模量', latex: `E_0 = 2(1+${p.mu})(${p.A}+${p.B}) \\times ${corr.toFixed(3)} = ${E0.toFixed(1)} \\text{ kPa}` }
            ]
          };
        }
      }
    ]
  },

  // ===================== 第二章 岩土工程设计基本原则 =====================
  {
    id: 'principles', name: '第二章 设计原则',
    formulas: [
      {
        id: 'principle_load_combo',
        name: '荷载效应标准组合',
        expr: 'S_k = \\sum G_{Gk} + \\sum \\psi_i G_{Qik}',
        note: 'GB 50007-2011 第 3.0.6 条，地基承载力验算用标准组合',
        params: [
          { key: 'G_Gk', label: 'G<sub>Gk</sub>', unit: 'kN', default: 500 },
          { key: 'G_Q1k', label: 'G<sub>Q1k</sub>', unit: 'kN', default: 300 },
          { key: 'psi_1', label: 'ψ₁', unit: '', default: 0.7 }
        ],
        scene: "地基承载力验算、基础底面积计算时确定荷载效应",
        pitfalls: ["地基承载力验算必须用标准组合，不能用基本组合", "ψ 组合值系数不同可变荷载取值不同，楼面活荷载 ψ=0.7，风荷载 ψ=0.6"],
        example: { G_Gk: 500, G_Q1k: 300, psi_1: 0.7 },
        calc: (p) => {
          const r = p.G_Gk + p.psi_1 * p.G_Q1k;
          return { value: r.toFixed(2), unit: 'kN', isValid: r > 0,
            steps: [
              { desc: '永久荷载标准值', latex: `G_{Gk} = ${p.G_Gk} \\text{ kN}` },
              { desc: '可变荷载组合值', latex: `\\psi_1 \\cdot G_{Q1k} = ${p.psi_1} \\times ${p.G_Q1k} = ${(p.psi_1*p.G_Q1k).toFixed(2)} \\text{ kN}` },
              { desc: '荷载效应标准组合', latex: `S_k = ${p.G_Gk} + ${(p.psi_1*p.G_Q1k).toFixed(2)} = ${r.toFixed(2)} \\text{ kN}` }
            ]
          };
        }
      },
      {
        id: 'principle_settlement',
        name: '地基变形计算（分层总和法）',
        expr: 's = \\sum_{i=1}^{n} \\frac{p_0}{E_{si}} z_i - \\sum_{i=1}^{n} \\frac{p_0}{E_{si}} z_{i-1}',
        note: 'GB 50007-2011 第 5.3.5 条',
        params: [
          { key: 'p0', label: 'p₀', unit: 'kPa', default: 100 },
          { key: 'Es', label: 'E<sub>s</sub>', unit: 'MPa', default: 5 },
          { key: 'z', label: 'z', unit: 'm', default: 3.0 }
        ],
        scene: "初步估算地基沉降量，判断是否满足变形控制要求",
        pitfalls: ["Es 单位是 MPa，p0 单位是 kPa，单位换算最容易错", "实际工程需分层计算后求和，单层只是简化"],
        example: { p0: 100, Es: 5, z: 3.0 },
        calc: (p) => {
          const r = (p.p0 * p.z * 1000) / (p.Es * 1000);
          return { value: r.toFixed(2), unit: 'mm（简化单层）', isValid: r > 0 && r < 300,
            steps: [
              { desc: '基础底面附加压力', latex: `p_0 = ${p.p0} \\text{ kPa}` },
              { desc: '压缩模量', latex: `E_s = ${p.Es} \\text{ MPa}` },
              { desc: '单层沉降（简化）', latex: `s = \\frac{p_0 \\cdot z}{E_s} = \\frac{${p.p0} \\times ${p.z}}{${p.Es}} = ${r.toFixed(2)} \\text{ mm}` }
            ]
          };
        }
      },
      {
        id: 'principle_partial_factor',
        name: '荷载基本组合（分项系数法）',
        expr: 'S = \\gamma_G S_{Gk} + \\gamma_Q S_{Qk}',
        note: 'GB 50009-2012 第 3.2 条，γG=1.2(不利)或1.35(有利)，γQ=1.4',
        params: [
          { key: 'gamma_G', label: 'γ<sub>G</sub>', unit: '', default: 1.2 },
          { key: 'SGk', label: 'S<sub>Gk</sub>', unit: 'kN', default: 500 },
          { key: 'gamma_Q', label: 'γ<sub>Q</sub>', unit: '', default: 1.4 },
          { key: 'SQk', label: 'S<sub>Qk</sub>', unit: 'kN', default: 300 }
        ],
        scene: "承载力极限状态设计，用分项系数法求荷载基本组合",
        pitfalls: ["γG 不利取 1.2，有利取 1.35（对结构安全有利时）", "γQ 一般取 1.4，标准值≤4kN/m² 时取 1.3", "基本组合用于强度验算，标准组合用于承载力验算"],
        example: { gamma_G: 1.2, SGk: 500, gamma_Q: 1.4, SQk: 300 },
        calc: (p) => {
          const r = p.gamma_G * p.SGk + p.gamma_Q * p.SQk;
          return { value: r.toFixed(2), unit: 'kN', isValid: r > 0,
            steps: [
              { desc: '永久荷载设计值', latex: `\\gamma_G \\cdot S_{Gk} = ${p.gamma_G} \\times ${p.SGk} = ${(p.gamma_G*p.SGk).toFixed(2)} \\text{ kN}` },
              { desc: '可变荷载设计值', latex: `\\gamma_Q \\cdot S_{Qk} = ${p.gamma_Q} \\times ${p.SQk} = ${(p.gamma_Q*p.SQk).toFixed(2)} \\text{ kN}` },
              { desc: '荷载基本组合', latex: `S = ${(p.gamma_G*p.SGk).toFixed(2)} + ${(p.gamma_Q*p.SQk).toFixed(2)} = ${r.toFixed(2)} \\text{ kN}` }
            ]
          };
        }
      }
    ]
  },

  // ===================== 第三章 浅基础 =====================
  {
    id: 'bearing', name: '第三章 浅基础',
    formulas: [
      {
        id: 'bearing_full',
        name: '承载力宽深修正',
        expr: 'f_a = f_{ak} + \\eta_b\\gamma(b-3) + \\eta_d\\gamma_m(d-0.5)',
        note: 'GB 50007-2011 第 5.2.4 条',
        params: [
          { key: 'f_ak', label: 'f<sub>ak</sub>', unit: 'kPa', default: 180 },
          { key: 'eta_b', label: 'η<sub>b</sub>', unit: '', default: 0.3 },
          { key: 'eta_d', label: 'η<sub>d</sub>', unit: '', default: 1.6 },
          { key: 'gamma', label: 'γ', unit: 'kN/m³', default: 18 },
          { key: 'gamma_m', label: 'γ<sub>m</sub>', unit: 'kN/m³', default: 18 },
          { key: 'b', label: 'b', unit: 'm', default: 3.5 },
          { key: 'd', label: 'd', unit: 'm', default: 1.5 }
        ],
        scene: "最核心公式！几乎所有浅基础题目第一步都是承载力修正",
        pitfalls: ["b≤3m 时宽度修正项为 0，不是用 (b-3) 得负数", "ηb、ηd 查表值取决于土的类别（黏性土/砂土/碎石土），查错表直接全错", "地下水位以下 γ 用浮重度 γ'=γsat-10"],
        example: { f_ak: 180, eta_b: 0.3, eta_d: 1.6, gamma: 18, gamma_m: 18, b: 3.5, d: 1.5 },
        calc: (p) => {
          const tb = p.eta_b * p.gamma * Math.max(p.b - 3, 0);
          const td = p.eta_d * p.gamma_m * Math.max(p.d - 0.5, 0);
          const r = p.f_ak + tb + td;
          return { value: r.toFixed(2), unit: 'kPa', isValid: r > 0,
            steps: [
              { desc: '查得地基承载力特征值', latex: `f_{ak} = ${p.f_ak} \\text{ kPa}` },
              { desc: '宽度修正项', latex: `\\eta_b \\cdot \\gamma \\cdot (b-3) = ${p.eta_b} \\times ${p.gamma} \\times ${Math.max(p.b-3,0).toFixed(2)} = ${tb.toFixed(2)} \\text{ kPa}` },
              { desc: '深度修正项', latex: `\\eta_d \\cdot \\gamma_m \\cdot (d-0.5) = ${p.eta_d} \\times ${p.gamma_m} \\times ${Math.max(p.d-0.5,0).toFixed(2)} = ${td.toFixed(2)} \\text{ kPa}` },
              { desc: '修正后承载力特征值', latex: `f_a = ${p.f_ak} + ${tb.toFixed(2)} + ${td.toFixed(2)} = ${r.toFixed(2)} \\text{ kPa}` }
            ]
          };
        }
      },
      {
        id: 'bearing_depth',
        name: '承载力深度修正',
        expr: 'f_a = f_{ak} + \\eta_d\\gamma_m(d-0.5)',
        note: '适用于 ηb=0 的情况（换填垫层、搅拌桩等）',
        params: [
          { key: 'f_ak', label: 'f<sub>ak</sub>', unit: 'kPa', default: 145 },
          { key: 'eta_d', label: 'η<sub>d</sub>', unit: '', default: 1.0 },
          { key: 'gamma_m', label: 'γ<sub>m</sub>', unit: 'kN/m³', default: 18 },
          { key: 'd', label: 'd', unit: 'm', default: 2.0 }
        ],
        scene: "换填垫层、搅拌桩等地基处理后承载力修正（ηb=0）",
        pitfalls: ["换填垫层 ηb=0、ηd=1.0，不是用原土的 η 值", "压实填土 ηd 取值与压实系数和黏粒含量有关，需分情况"],
        example: { f_ak: 145, eta_d: 1.0, gamma_m: 18, d: 2.0 },
        calc: (p) => {
          const td = p.eta_d * p.gamma_m * Math.max(p.d - 0.5, 0);
          const r = p.f_ak + td;
          return { value: r.toFixed(2), unit: 'kPa', isValid: r > 0,
            steps: [
              { desc: '查得地基承载力特征值', latex: `f_{ak} = ${p.f_ak} \\text{ kPa}` },
              { desc: '深度修正项', latex: `\\eta_d \\cdot \\gamma_m \\cdot (d-0.5) = ${p.eta_d} \\times ${p.gamma_m} \\times ${Math.max(p.d-0.5,0).toFixed(2)} = ${td.toFixed(2)} \\text{ kPa}` },
              { desc: '修正后承载力特征值', latex: `f_a = ${p.f_ak} + ${td.toFixed(2)} = ${r.toFixed(2)} \\text{ kPa}` }
            ]
          };
        }
      },
      {
        id: 'bearing_weak',
        name: '软弱下卧层验算',
        expr: 'p_z + p_{cz} \\leq f_{az}',
        note: 'GB 50007-2011 第 5.2.7 条',
        params: [
          { key: 'p_z', label: 'p<sub>z</sub>', unit: 'kPa', default: 100 },
          { key: 'p_cz', label: 'p<sub>cz</sub>', unit: 'kPa', default: 50 },
          { key: 'f_az', label: 'f<sub>az</sub>', unit: 'kPa', default: 180 }
        ],
        scene: "基础底下有软弱土层时必须验算，高频考点",
        pitfalls: ["pz 是附加应力不是总应力，需先算 pz 再算 pcz", "faz 也需要做深度修正，不能直接用 fak"],
        example: { p_z: 100, p_cz: 50, f_az: 180 },
        calc: (p) => {
          const total = p.p_z + p.p_cz;
          const margin = p.f_az - total;
          return { value: margin.toFixed(2), unit: 'kPa（安全裕度）', isValid: total <= p.f_az,
            steps: [
              { desc: '软弱下卧层顶面附加应力', latex: `p_z = ${p.p_z} \\text{ kPa}` },
              { desc: '软弱下卧层顶面自重应力', latex: `p_{cz} = ${p.p_cz} \\text{ kPa}` },
              { desc: '总应力', latex: `p_z + p_{cz} = ${p.p_z} + ${p.p_cz} = ${total.toFixed(2)} \\text{ kPa}` },
              { desc: '验算', latex: `${total.toFixed(2)} ${total <= p.f_az ? '\\leq' : '>'} ${p.f_az} \\text{ kPa}${total <= p.f_az ? ' \\quad \\text{满足要求}' : ' \\quad \\text{不满足要求}'}` }
            ]
          };
        }
      },
      {
        id: 'bearing_area',
        name: '基础底面积计算',
        expr: 'A \\geq \\frac{F_k}{f_a - \\gamma_G d}',
        note: 'GB 50007-2011 第 5.2.1 条',
        params: [
          { key: 'F_k', label: 'F<sub>k</sub>', unit: 'kN', default: 1200 },
          { key: 'f_a', label: 'f<sub>a</sub>', unit: 'kPa', default: 200 },
          { key: 'gamma_G', label: 'γ<sub>G</sub>', unit: 'kN/m³', default: 20 },
          { key: 'd', label: 'd', unit: 'm', default: 1.5 }
        ],
        scene: "已知上部荷载反求基础底面积，基础设计第一步",
        pitfalls: ["分母 fa-γG·d 可能≤0，说明承载力不足需调整", "算出 A 后还需考虑偏心、抗浮等，A 只是最小值"],
        example: { F_k: 1200, f_a: 200, gamma_G: 20, d: 1.5 },
        calc: (p) => {
          const den = p.f_a - p.gamma_G * p.d;
          if (den <= 0) return { value: '—', unit: 'm²', isValid: false,
            steps: [{ desc: '净承载力', latex: `f_a - \\gamma_G \\cdot d = ${p.f_a} - ${(p.gamma_G*p.d).toFixed(2)} \\leq 0` }, { desc: '需增大埋深或提高承载力', latex: '' }]};
          const r = p.F_k / den;
          return { value: r.toFixed(2), unit: 'm²', isValid: r > 0,
            steps: [
              { desc: '基础及回填土重度产生的应力', latex: `\\gamma_G \\cdot d = ${p.gamma_G} \\times ${p.d} = ${(p.gamma_G*p.d).toFixed(2)} \\text{ kPa}` },
              { desc: '净承载力', latex: `f_a - \\gamma_G \\cdot d = ${p.f_a} - ${(p.gamma_G*p.d).toFixed(2)} = ${den.toFixed(2)} \\text{ kPa}` },
              { desc: '所需基础底面面积', latex: `A \\geq \\frac{${p.F_k}}{${den.toFixed(2)}} = ${r.toFixed(2)} \\text{ m}^2` }
            ]
          };
        }
      },
      {
        id: 'bearing_ec2',
        name: '基底最大/最小压力',
        expr: 'p_{max,min} = \\frac{F_k + G_k}{A} \\pm \\frac{M_k}{W}',
        note: 'GB 50007-2011 第 5.2.1 条，偏心荷载作用',
        params: [
          { key: 'F_k', label: 'F<sub>k</sub>', unit: 'kN', default: 1000 },
          { key: 'G_k', label: 'G<sub>k</sub>', unit: 'kN', default: 300 },
          { key: 'A', label: 'A', unit: 'm²', default: 6.0 },
          { key: 'M_k', label: 'M<sub>k</sub>', unit: 'kN·m', default: 200 },
          { key: 'W', label: 'W', unit: 'm³', default: 2.0 }
        ],
        scene: "偏心荷载下基底压力分布验算，判断是否出现拉应力",
        pitfalls: ["pmin<0 说明基底出现拉区，需增大基础尺寸", "W 是截面模量，矩形基础 W=b·l²/6，别和面积搞混"],
        example: { F_k: 1000, G_k: 300, A: 6.0, M_k: 200, W: 2.0 },
        calc: (p) => {
          const p0 = (p.F_k + p.G_k) / p.A;
          const pm = p.M_k / p.W;
          return { value: `${(p0+pm).toFixed(2)} / ${(p0-pm).toFixed(2)}`, unit: 'kPa (max / min)', isValid: (p0-pm) >= 0,
            steps: [
              { desc: '轴心荷载基底压力', latex: `\\frac{F_k + G_k}{A} = \\frac{${p.F_k} + ${p.G_k}}{${p.A}} = ${p0.toFixed(2)} \\text{ kPa}` },
              { desc: '偏心弯矩附加压力', latex: `\\frac{M_k}{W} = \\frac{${p.M_k}}{${p.W}} = ${pm.toFixed(2)} \\text{ kPa}` },
              { desc: '基底最大/最小压力', latex: `p_{max} = ${p0.toFixed(2)} + ${pm.toFixed(2)} = ${(p0+pm).toFixed(2)} \\text{ kPa}` },
              { desc: '', latex: `p_{min} = ${p0.toFixed(2)} - ${pm.toFixed(2)} = ${(p0-pm).toFixed(2)} \\text{ kPa}${(p0-pm) < 0 ? ' < 0 \\quad \\text{基底出现拉应力，需调整}' : ''}` }
            ]
          };
        }
      },
      {
        id: 'bearing_spread',
        name: '地基附加应力（角点法）',
        expr: 'p_z = 4 \\cdot \\bar{\\alpha} \\cdot p_0',
        note: 'GB 50007-2011 第 5.2.7 条，矩形基础中心点下附加应力',
        params: [
          { key: 'alpha', label: 'α̅', unit: '', default: 0.175 },
          { key: 'p0', label: 'p₀', unit: 'kPa', default: 100 }
        ],
        scene: "软弱下卧层验算中求附加应力 pz（角点法/中心点法）",
        pitfalls: ["矩形基础中心点用 4 倍角点法，角点用 1 倍", "α̅ 查表时 l/b 和 z/l 的比值容易搞反"],
        example: { alpha: 0.175, p0: 100 },
        calc: (p) => {
          const r = 4 * p.alpha * p.p0;
          return { value: r.toFixed(2), unit: 'kPa', isValid: r > 0,
            steps: [
              { desc: '角点法影响系数', latex: `\\bar{\\alpha} = ${p.alpha}` },
              { desc: '基础中心点附加应力', latex: `p_z = 4 \\times ${p.alpha} \\times ${p.p0} = ${r.toFixed(2)} \\text{ kPa}` }
            ]
          };
        }
      },
      {
        id: 'bearing_eccentric',
        name: '偏心距验算',
        expr: 'e = \\frac{M_k}{F_k + G_k} \\leq \\frac{b}{6}',
        note: 'GB 50007-2011 第 5.2.1 条，偏心距不得超过基础底面核心半径',
        params: [
          { key: 'M_k', label: 'M<sub>k</sub>', unit: 'kN·m', default: 200 },
          { key: 'F_k', label: 'F<sub>k</sub>', unit: 'kN', default: 1000 },
          { key: 'G_k', label: 'G<sub>k</sub>', unit: 'kN', default: 300 },
          { key: 'b', label: 'b', unit: 'm', default: 4.0 }
        ],
        scene: "偏心荷载验算，判断偏心距是否在核心范围内",
        pitfalls: ["e>b/6 时基底出现拉应力区，pmin<0", "Gk 不能漏算（基础自重+回填土重）"],
        example: { M_k: 200, F_k: 1000, G_k: 300, b: 4.0 },
        calc: (p) => {
          const e = p.M_k / (p.F_k + p.G_k);
          const limit = p.b / 6;
          return { value: e.toFixed(4), unit: `m（限值 ${limit.toFixed(4)} m）`, isValid: e <= limit,
            steps: [
              { desc: '偏心距', latex: `e = \\frac{M_k}{F_k + G_k} = \\frac{${p.M_k}}{${p.F_k} + ${p.G_k}} = ${e.toFixed(4)} \\text{ m}` },
              { desc: '允许偏心距', latex: `\\frac{b}{6} = \\frac{${p.b}}{6} = ${limit.toFixed(4)} \\text{ m}` },
              { desc: '验算', latex: `e = ${e.toFixed(4)} ${e <= limit ? '\\leq' : '>'} \\frac{b}{6} = ${limit.toFixed(4)}${e <= limit ? '\\quad \\text{满足}' : '\\quad \\text{不满足}'}` }
            ]
          };
        }
      },
      {
        id: 'bearing_settle_ec2',
        name: '地基最终沉降量（规范法）',
        expr: 's = \\psi_s \\sum \\frac{p_0}{E_{si}}(z_i \\bar{\\alpha}_i - z_{i-1} \\bar{\\alpha}_{i-1})',
        note: 'GB 50007-2011 第 5.3.5 条（简化单层）',
        params: [
          { key: 'psi_s', label: 'ψ<sub>s</sub>', unit: '', default: 1.0 },
          { key: 'p0', label: 'p₀', unit: 'kPa', default: 100 },
          { key: 'Es', label: 'E<sub>si</sub>', unit: 'MPa', default: 5.0 },
          { key: 'zi_ai', label: 'zᵢα̅ᵢ', unit: 'm', default: 0.8 },
          { key: 'zi1_ai1', label: 'zᵢ₋₁α̅ᵢ₋₁', unit: 'm', default: 0.5 }
        ],
        scene: "规范法计算地基最终沉降量，分层求和后乘以 ψs",
        pitfalls: ["Es 单位 MPa 需换算为 kPa（×1000）", "ψs 按平均压力与 Es 查表，不同土性取值不同", "zᵢα̅ᵢ 是累积值，不是单层值"],
        example: { psi_s: 1.0, p0: 100, Es: 5.0, zi_ai: 0.8, zi1_ai1: 0.5 },
        calc: (p) => {
          const r = p.psi_s * p.p0 / (p.Es * 1000) * (p.zi_ai - p.zi1_ai1) * 1000;
          return { value: r.toFixed(2), unit: 'mm（单层）', isValid: r > 0 && r < 300,
            steps: [
              { desc: '沉降计算经验系数', latex: `\\psi_s = ${p.psi_s}` },
              { desc: '影响系数差', latex: `z_i\\bar{\\alpha}_i - z_{i-1}\\bar{\\alpha}_{i-1} = ${p.zi_ai} - ${p.zi1_ai1} = ${(p.zi_ai - p.zi1_ai1).toFixed(4)} \\text{ m}` },
              { desc: '该层沉降', latex: `s_i = ${p.psi_s} \\times \\frac{${p.p0}}{${p.Es} \\times 1000} \\times ${(p.zi_ai - p.zi1_ai1).toFixed(4)} \\times 1000 = ${r.toFixed(2)} \\text{ mm}` }
            ]
          };
        }
      },
      {
        id: 'bearing_terzaghi',
        name: '太沙基极限承载力',
        expr: 'p_u = c N_c + \\gamma \\frac{b}{2} N_\\gamma + \\gamma d N_q',
        note: 'Terzaghi 1943，条形基础（方形乘 1.3，圆形乘 1.3）',
        params: [
          { key: 'c', label: 'c', unit: 'kPa', default: 20 },
          { key: 'Nc', label: 'N<sub>c</sub>', unit: '', default: 5.14 },
          { key: 'gamma', label: 'γ', unit: 'kN/m³', default: 18 },
          { key: 'b', label: 'b', unit: 'm', default: 2.0 },
          { key: 'Ngamma', label: 'N<sub>γ</sub>', unit: '', default: 1.0 },
          { key: 'Nq', label: 'N<sub>q</sub>', unit: '', default: 1.0 },
          { key: 'd', label: 'd', unit: 'm', default: 1.5 }
        ],
        scene: "太沙基极限承载力理论公式，三种承载力系数 Nc、Nq、Nγ 由 φ 确定",
        pitfalls: ["Nc、Nq、Nγ 由 φ 角查表，φ=0 时 Nc=5.14、Nq=1、Nγ=0", "条形基础直接用，方形/圆形需乘以 1.3", "第三类边界条件（局部剪切破坏）需用 φ' 和修正系数"],
        example: { c: 20, Nc: 5.14, gamma: 18, b: 2.0, Ngamma: 1.0, Nq: 1.0, d: 1.5 },
        calc: (p) => {
          const tc = p.c * p.Nc;
          const tg = p.gamma * p.b / 2 * p.Ngamma;
          const td = p.gamma * p.d * p.Nq;
          const r = tc + tg + td;
          return { value: r.toFixed(2), unit: 'kPa（极限承载力pu）', isValid: r > 0,
            steps: [
              { desc: '黏聚力项', latex: `c N_c = ${p.c} \\times ${p.Nc} = ${tc.toFixed(2)} \\text{ kPa}` },
              { desc: '重度项（基底宽度）', latex: `\\gamma \\cdot \\frac{b}{2} \\cdot N_\\gamma = ${p.gamma} \\times \\frac{${p.b}}{2} \\times ${p.Ngamma} = ${tg.toFixed(2)} \\text{ kPa}` },
              { desc: '埋深项', latex: `\\gamma \\cdot d \\cdot N_q = ${p.gamma} \\times ${p.d} \\times ${p.Nq} = ${td.toFixed(2)} \\text{ kPa}` },
              { desc: '极限承载力', latex: `p_u = ${tc.toFixed(2)} + ${tg.toFixed(2)} + ${td.toFixed(2)} = ${r.toFixed(2)} \\text{ kPa}` }
            ]
          };
        }
      },
      {
        id: 'bearing_boussinesq',
        name: 'Boussinesq 集中荷载附加应力',
        expr: '\\sigma_z = \\frac{3P}{2\\pi} \\frac{z^3}{(r^2+z^2)^{5/2}}',
        note: 'Boussinesq 1885，集中力作用下竖向附加应力',
        params: [
          { key: 'P', label: 'P', unit: 'kN', default: 100 },
          { key: 'z', label: 'z', unit: 'm', default: 2 },
          { key: 'r', label: 'r', unit: 'm', default: 1 }
        ],
        scene: "集中荷载下任意深度 z、径向距离 r 处的竖向附加应力",
        pitfalls: ["r=0 时（轴线上）：σz=0.4775·P/z²", "z 增大 σz 迅速衰减", "仅适用于均质各向同性弹性半空间"],
        example: { P: 100, z: 2, r: 1 },
        calc: (p) => {
          const den = (p.r * p.r + p.z * p.z) ** 2.5;
          const r = (3 * p.P / (2 * Math.PI)) * (p.z * p.z * p.z) / den;
          return { value: r.toFixed(2), unit: 'kPa', isValid: r > 0,
            steps: [
              { desc: '集中力', latex: `P = ${p.P} \\text{ kN}` },
              { desc: '深度与径向距离', latex: `z = ${p.z} \\text{ m}, \\quad r = ${p.r} \\text{ m}` },
              { desc: '竖向附加应力', latex: `\\sigma_z = \\frac{3 \\times ${p.P}}{2\\pi} \\cdot \\frac{${p.z}^3}{(${p.r}^2 + ${p.z}^2)^{5/2}} = ${r.toFixed(2)} \\text{ kPa}` }
            ]
          };
        }
      },
      {
        id: 'bearing_strip',
        name: '条形基础地基承载力',
        expr: 'f_a = \\frac{1}{3} p_u = \\frac{1}{3}(c N_c + \\gamma d N_q)',
        note: 'φ=0 土（纯黏性土）条形基础容许承载力简化',
        params: [
          { key: 'c', label: 'c<sub>u</sub>', unit: 'kPa', default: 60 },
          { key: 'Nc', label: 'N<sub>c</sub>', unit: '', default: 5.14 },
          { key: 'gamma', label: 'γ', unit: 'kN/m³', default: 18 },
          { key: 'd', label: 'd', unit: 'm', default: 1.5 },
          { key: 'Nq', label: 'N<sub>q</sub>', unit: '', default: 1.0 },
          { key: 'Ks', label: 'K<sub>s</sub>', unit: '', default: 3.0 }
        ],
        scene: "纯黏性土（φ=0）条形基础容许承载力，安全系数 Ks=3",
        pitfalls: ["φ=0 时 Nc=5.14、Nq=1、Nγ=0", "安全系数 Ks 规范取 3.0", "有 φ 时需用完整太沙基公式再除以 Ks"],
        example: { c: 60, Nc: 5.14, gamma: 18, d: 1.5, Nq: 1.0, Ks: 3.0 },
        calc: (p) => {
          const pu = p.c * p.Nc + p.gamma * p.d * p.Nq;
          const r = pu / p.Ks;
          return { value: r.toFixed(2), unit: 'kPa（容许承载力）', isValid: r > 0,
            steps: [
              { desc: '极限承载力', latex: `p_u = c N_c + \\gamma d N_q = ${p.c} \\times ${p.Nc} + ${p.gamma} \\times ${p.d} \\times ${p.Nq} = ${pu.toFixed(2)} \\text{ kPa}` },
              { desc: '容许承载力', latex: `f_a = \\frac{p_u}{K_s} = \\frac{${pu.toFixed(2)}}{${p.Ks}} = ${r.toFixed(2)} \\text{ kPa}` }
            ]
          };
        }
      },
      {
        id: 'bearing_anti_float',
        name: '基础抗浮验算',
        expr: 'G_k \\geq K \\cdot F_{wk}',
        note: 'GB 50007-2011，Gk=结构自重，Fwk=浮力，K=抗浮安全系数',
        params: [
          { key: 'Gk', label: 'G<sub>k</sub>', unit: 'kN', default: 500 },
          { key: 'Fwk', label: 'F<sub>wk</sub>', unit: 'kN', default: 400 },
          { key: 'K', label: 'K', unit: '', default: 1.05 }
        ],
        scene: "地下水位以下基础抗浮稳定性验算",
        pitfalls: ["K 一般取 1.05~1.10，重要工程取 1.10", "Gk 包括基础自重+覆土重+上部结构重", "Fwk=γw·hw·A，hw 为水位至基底高度"],
        example: { Gk: 500, Fwk: 400, K: 1.05 },
        calc: (p) => {
          const req = p.K * p.Fwk;
          const ratio = p.Gk / p.Fwk;
          return { value: ratio.toFixed(3), unit: '（抗浮安全系数）', isValid: p.Gk >= req,
            steps: [
              { desc: '抗浮力（结构自重）', latex: `G_k = ${p.Gk} \\text{ kN}` },
              { desc: '浮力设计值', latex: `K \\cdot F_{wk} = ${p.K} \\times ${p.Fwk} = ${req.toFixed(2)} \\text{ kN}` },
              { desc: '验算', latex: `G_k = ${p.Gk} ${p.Gk >= req ? '\\geq' : '<'} ${req.toFixed(2)}${p.Gk >= req ? '\\quad \\text{抗浮满足}' : '\\quad \\text{抗浮不满足，需增设抗浮锚杆}'}` }
            ]
          };
        }
      }
    ]
  },
  // ===================== 第四章 深基础（桩基） =====================
  {
    id: 'pile', name: '第四章 桩基',
    formulas: [
      {
        id: 'pile_ra',
        name: '单桩竖向承载力 Ra',
        expr: 'R_a = \\frac{u_p \\sum q_{sik} l_i + q_{pk} A_p}{2}',
        note: 'JGJ 94-2008 第 5.3.3 条（简化单层）',
        params: [
          { key: 'u_p', label: 'u<sub>p</sub>', unit: 'm', default: 1.885 },
          { key: 'q_sk', label: 'q<sub>sik</sub>', unit: 'kPa', default: 50 },
          { key: 'l_s', label: 'l<sub>s</sub>', unit: 'm', default: 20 },
          { key: 'q_pk', label: 'q<sub>p k</sub>', unit: 'kPa', default: 1200 },
          { key: 'a_p', label: 'A<sub>p</sub>', unit: 'm²', default: 0.283 }
        ],
        scene: "桩基设计核心公式，由地质参数求单桩承载力",
        pitfalls: ["安全系数 2 不能忘（Ra=Quk/2）", "up=π·d，桩径 d 单位是 m 不是 mm", "qsik、qpk 查表值与桩型（预制/灌注）有关"],
        example: { u_p: 1.885, q_sk: 50, l_s: 20, q_pk: 1200, a_p: 0.283 },
        calc: (p) => {
          const sf = p.u_p * p.q_sk * p.l_s;
          const tr = p.q_pk * p.a_p;
          const r = (sf + tr) / 2;
          return { value: r.toFixed(2), unit: 'kN', isValid: r > 0,
            steps: [
              { desc: '桩侧总摩阻力', latex: `u_p \\cdot q_{sik} \\cdot l_s = ${p.u_p} \\times ${p.q_sk} \\times ${p.l_s} = ${sf.toFixed(2)} \\text{ kN}` },
              { desc: '桩端阻力', latex: `q_{pk} \\cdot A_p = ${p.q_pk} \\times ${p.a_p} = ${tr.toFixed(2)} \\text{ kN}` },
              { desc: '单桩竖向承载力特征值', latex: `R_a = \\frac{${sf.toFixed(2)} + ${tr.toFixed(2)}}{2} = ${r.toFixed(2)} \\text{ kN}` }
            ]
          };
        }
      },
      {
        id: 'pile_quk',
        name: '单桩极限承载力 Quk',
        expr: 'Q_{uk} = u_p \\sum q_{sik} l_i + A_p \\cdot q_{pk}',
        note: 'JGJ 94-2008（不除以安全系数）',
        params: [
          { key: 'u_p', label: 'u<sub>p</sub>', unit: 'm', default: 1.885 },
          { key: 'q_sk', label: 'q<sub>sik</sub>', unit: 'kPa', default: 50 },
          { key: 'l_s', label: 'l<sub>s</sub>', unit: 'm', default: 20 },
          { key: 'q_pk', label: 'q<sub>p k</sub>', unit: 'kPa', default: 1200 },
          { key: 'a_p', label: 'A<sub>p</sub>', unit: 'm²', default: 0.283 }
        ],
        scene: "求单桩极限承载力标准值，不除以安全系数",
        pitfalls: ["与 Ra 的区别：Quk 不除以 2", "多土层需分层求和 Σ(qsik·li)", "端阻力 qpk 只在桩端土层取值"],
        example: { u_p: 1.885, q_sk: 50, l_s: 20, q_pk: 1200, a_p: 0.283 },
        calc: (p) => {
          const sf = p.u_p * p.q_sk * p.l_s;
          const tr = p.q_pk * p.a_p;
          const r = sf + tr;
          return { value: r.toFixed(2), unit: 'kN', isValid: r > 0,
            steps: [
              { desc: '桩侧总摩阻力', latex: `u_p \\cdot q_{sik} \\cdot l_s = ${p.u_p} \\times ${p.q_sk} \\times ${p.l_s} = ${sf.toFixed(2)} \\text{ kN}` },
              { desc: '桩端阻力', latex: `A_p \\cdot q_{pk} = ${p.a_p} \\times ${p.q_pk} = ${tr.toFixed(2)} \\text{ kN}` },
              { desc: '单桩竖向极限承载力标准值', latex: `Q_{uk} = ${sf.toFixed(2)} + ${tr.toFixed(2)} = ${r.toFixed(2)} \\text{ kN}` }
            ]
          };
        }
      },
      {
        id: 'pile_group_eff',
        name: '群桩效率系数',
        expr: '\\eta_g = \\frac{R_{a,group}}{n \\cdot R_a}',
        note: 'JGJ 94-2008 群桩效应',
        params: [
          { key: 'R_ag', label: 'R<sub>a,group</sub>', unit: 'kN', default: 5000 },
          { key: 'n', label: 'n', unit: '根', default: 4 },
          { key: 'Ra', label: 'R<sub>a</sub>', unit: 'kN', default: 1500 }
        ],
        scene: "群桩效应分析，判断群桩承载力折减程度",
        pitfalls: ["ηg 通常<1（摩擦桩），端承桩 ηg 可>1", "ηg>1.2 说明数据可能有误"],
        example: { R_ag: 5000, n: 4, Ra: 1500 },
        calc: (p) => {
          const s = p.n * p.Ra;
          if (s <= 0) return { value: '—', unit: '', isValid: false, steps: [{ desc: '分母 ≤ 0', latex: '' }]};
          const r = p.R_ag / s;
          return { value: r.toFixed(3), unit: '', isValid: r > 0 && r <= 1.2,
            steps: [
              { desc: '群桩竖向承载力', latex: `R_{a,group} = ${p.R_ag} \\text{ kN}` },
              { desc: '单桩承载力总和', latex: `n \\cdot R_a = ${p.n} \\times ${p.Ra} = ${s.toFixed(2)} \\text{ kN}` },
              { desc: '群桩效率系数', latex: `\\eta_g = \\frac{${p.R_ag}}{${s.toFixed(2)}} = ${r.toFixed(3)}` }
            ]
          };
        }
      },
      {
        id: 'pile_neg_friction',
        name: '负摩阻力计算',
        expr: 'Q_{g,n} = \\sum \\psi_n \\cdot u_i \\cdot q_{si} \\cdot l_i',
        note: 'JGJ 94-2008 第 5.4 节 负摩阻力（简化单层）',
        params: [
          { key: 'psi_n', label: 'ψ<sub>n</sub>', unit: '', default: 0.7 },
          { key: 'u_p', label: 'u<sub>p</sub>', unit: 'm', default: 1.885 },
          { key: 'q_si', label: 'q<sub>si</sub>', unit: 'kPa', default: 30 },
          { key: 'l_i', label: 'l<sub>i</sub>', unit: 'm', default: 8 }
        ],
        scene: "填土地基、抽水降水位等情况下桩产生负摩阻力",
        pitfalls: ["负摩阻力是\"向下拉\"的力，增大桩的轴向荷载", "中性点以上有负摩阻力，以下有正摩阻力", "ψn 折减系数按桩型查表"],
        example: { psi_n: 0.7, u_p: 1.885, q_si: 30, l_i: 8 },
        calc: (p) => {
          const r = p.psi_n * p.u_p * p.q_si * p.l_i;
          return { value: r.toFixed(2), unit: 'kN', isValid: r > 0,
            steps: [
              { desc: '负摩阻力标准值', latex: `Q_{g,n} = \\psi_n \\cdot u_p \\cdot q_{si} \\cdot l_i` },
              { desc: '代入计算', latex: `= ${p.psi_n} \\times ${p.u_p} \\times ${p.q_si} \\times ${p.l_i} = ${r.toFixed(2)} \\text{ kN}` }
            ]
          };
        }
      },
      {
        id: 'pile_cpt',
        name: '静力触探法单桩承载力',
        expr: 'R_a = \\frac{u_p \\cdot \\beta \\cdot \\sum q_{ci} l_i + \\alpha \\cdot q_{ck} \\cdot A_p}{K}',
        note: 'JGJ 94-2008 第 5.3.8 条（静探法简化单层）',
        params: [
          { key: 'u_p', label: 'u<sub>p</sub>', unit: 'm', default: 1.885 },
          { key: 'beta', label: 'β', unit: '', default: 2.0 },
          { key: 'qc', label: 'q<sub>c</sub>', unit: 'MPa', default: 4.0 },
          { key: 'l_i', label: 'l<sub>i</sub>', unit: 'm', default: 15 },
          { key: 'alpha', label: 'α', unit: '', default: 1.5 },
          { key: 'qck', label: 'q<sub>ck</sub>', unit: 'MPa', default: 8.0 },
          { key: 'a_p', label: 'A<sub>p</sub>', unit: 'm²', default: 0.283 },
          { key: 'K', label: 'K', unit: '', default: 2.0 }
        ],
        scene: "用静力触探（CPT）数据估算单桩承载力",
        pitfalls: ["β、α 是地区经验系数，必须用当地取值", "qc 单位 MPa 需×1000 转为 kPa", "桩端阻力 qck 取桩端 4d 范围内平均值"],
        example: { u_p: 1.885, beta: 2.0, qc: 4.0, l_i: 15, alpha: 1.5, qck: 8.0, a_p: 0.283, K: 2.0 },
        calc: (p) => {
          const sf = p.u_p * p.beta * p.qc * 1000 * p.l_i;
          const tr = p.alpha * p.qck * 1000 * p.a_p;
          const r = (sf + tr) / p.K;
          return { value: r.toFixed(2), unit: 'kN', isValid: r > 0,
            steps: [
              { desc: '桩侧摩阻力（静探）', latex: `u_p \\cdot \\beta \\cdot q_c \\cdot l_i = ${p.u_p} \\times ${p.beta} \\times ${p.qc} \\times 1000 \\times ${p.l_i} = ${sf.toFixed(2)} \\text{ kN}` },
              { desc: '桩端阻力（静探）', latex: `\\alpha \\cdot q_{ck} \\cdot A_p = ${p.alpha} \\times ${p.qck} \\times 1000 \\times ${p.a_p} = ${tr.toFixed(2)} \\text{ kN}` },
              { desc: '单桩承载力', latex: `R_a = \\frac{${sf.toFixed(2)} + ${tr.toFixed(2)}}{${p.K}} = ${r.toFixed(2)} \\text{ kN}` }
            ]
          };
        }
      },
      {
        id: 'pile_large_dia',
        name: '大直径桩端阻力修正',
        expr: 'q_{pk} = \\xi_p \\cdot q_{pk0}',
        note: 'JGJ 94-2008 第 5.3.9 条，桩径>600mm 需修正',
        params: [
          { key: 'xi_p', label: 'ξ<sub>p</sub>', unit: '', default: 0.8 },
          { key: 'qpk0', label: 'q<sub>pk0</sub>', unit: 'kPa', default: 1500 },
          { key: 'd', label: 'd', unit: 'mm', default: 800 }
        ],
        scene: "大直径桩（d>600mm）端阻力需乘以修正系数 ξp",
        pitfalls: ["ξp 随桩径增大而减小，查表取值", "仅对端阻力修正，侧阻力不修正", "d≤600mm 时 ξp=1.0 不修正"],
        example: { xi_p: 0.8, qpk0: 1500, d: 800 },
        calc: (p) => {
          const r = p.xi_p * p.qpk0;
          return { value: r.toFixed(2), unit: 'kPa', isValid: r > 0,
            steps: [
              { desc: '查表端阻力标准值', latex: `q_{pk0} = ${p.qpk0} \\text{ kPa}` },
              { desc: '大直径修正系数', latex: `\\xi_p = ${p.xi_p} \\quad (d = ${p.d} \\text{ mm})` },
              { desc: '修正后端阻力', latex: `q_{pk} = ${p.xi_p} \\times ${p.qpk0} = ${r.toFixed(2)} \\text{ kPa}` }
            ]
          };
        }
      },
      {
        id: 'pile_uplift',
        name: '单桩抗拔承载力',
        expr: 'R_{ak} = \\frac{u_p \\sum \\lambda_i q_{sik} l_i}{K}',
        note: 'JGJ 94-2008 第 5.4 节，λi=抗拔系数',
        params: [
          { key: 'u_p', label: 'u<sub>p</sub>', unit: 'm', default: 1.885 },
          { key: 'lambda', label: 'λ', unit: '', default: 0.7 },
          { key: 'q_sk', label: 'q<sub>sik</sub>', unit: 'kPa', default: 50 },
          { key: 'l_s', label: 'l<sub>s</sub>', unit: 'm', default: 20 },
          { key: 'K', label: 'K', unit: '', default: 2.0 }
        ],
        scene: "抗拔桩承载力计算（如输电塔桩基、挡墙锚桩）",
        pitfalls: ["λ 是抗拔系数，黏性土 0.6~0.7，砂土 0.7~0.8", "抗拔承载力远小于抗压（因为 λ<1）", "端阻力不参与抗拔"],
        example: { u_p: 1.885, lambda: 0.7, q_sk: 50, l_s: 20, K: 2.0 },
        calc: (p) => {
          const r = (p.u_p * p.lambda * p.q_sk * p.l_s) / p.K;
          return { value: r.toFixed(2), unit: 'kN', isValid: r > 0,
            steps: [
              { desc: '抗拔系数折减侧摩阻', latex: `u_p \\cdot \\lambda \\cdot q_{sik} \\cdot l_s = ${p.u_p} \\times ${p.lambda} \\times ${p.q_sk} \\times ${p.l_s} = ${(p.u_p*p.lambda*p.q_sk*p.l_s).toFixed(2)} \\text{ kN}` },
              { desc: '单桩抗拔承载力', latex: `R_{ak} = \\frac{${(p.u_p*p.lambda*p.q_sk*p.l_s).toFixed(2)}}{${p.K}} = ${r.toFixed(2)} \\text{ kN}` }
            ]
          };
        }
      },
      {
        id: 'pile_horiz',
        name: '单桩水平承载力',
        expr: 'R_{ha} = \\alpha \\cdot (\\phi_{pk} + \\mu_0 q_{ik} b_0)',
        note: 'JGJ 94-2008 第 5.7 节（简化）',
        params: [
          { key: 'alpha', label: 'α', unit: '1/m', default: 0.8 },
          { key: 'phi_pk', label: 'φ<sub>pk</sub>', unit: 'kN', default: 50 },
          { key: 'mu_0', label: 'μ₀', unit: '', default: 1.0 },
          { key: 'q_ik', label: 'q<sub>ik</sub>', unit: 'kPa', default: 20 },
          { key: 'b_0', label: 'b₀', unit: 'm', default: 0.5 }
        ],
        scene: "桩承受水平荷载（如桥桩）时的承载力",
        pitfalls: ["α 是桩的水平变形系数，与 EpIp/E0 有关", "b₀ 是桩的计算宽度，与桩径和埋深有关"],
        example: { alpha: 0.8, phi_pk: 50, mu_0: 1.0, q_ik: 20, b_0: 0.5 },
        calc: (p) => {
          const soil = p.mu_0 * p.q_ik * p.b_0;
          const r = p.alpha * (p.phi_pk + soil);
          return { value: r.toFixed(2), unit: 'kN', isValid: r > 0,
            steps: [
              { desc: '土体水平抗力项', latex: `\\mu_0 \\cdot q_{ik} \\cdot b_0 = ${p.mu_0} \\times ${p.q_ik} \\times ${p.b_0} = ${soil.toFixed(2)} \\text{ kN}` },
              { desc: '单桩水平承载力', latex: `R_{ha} = \\alpha \\cdot (${p.phi_pk} + ${soil.toFixed(2)}) = ${p.alpha} \\times ${(p.phi_pk+soil).toFixed(2)} = ${r.toFixed(2)} \\text{ kN}` }
            ]
          };
        }
      },
      {
        id: 'pile_group_bearing',
        name: '群桩竖向承载力',
        expr: 'R = \\min(n R_a, \\eta_g \\cdot n \\cdot R_a)',
        note: 'JGJ 94-2008 第 5.2.5 条，取单桩总和与考虑群效应的较小值',
        params: [
          { key: 'n', label: 'n', unit: '根', default: 9 },
          { key: 'Ra', label: 'R<sub>a</sub>', unit: 'kN', default: 800 },
          { key: 'eta_g', label: 'η<sub>g</sub>', unit: '', default: 0.85 }
        ],
        scene: "群桩基础总承载力计算，取单桩总和与群效应的小值",
        pitfalls: ["摩擦桩群 ηg<1，取 ηg·n·Ra", "端承桩群 ηg≈1，取 n·Ra", "必须比较后取小值"],
        example: { n: 9, Ra: 800, eta_g: 0.85 },
        calc: (p) => {
          const sum = p.n * p.Ra;
          const group = p.eta_g * sum;
          const r = Math.min(sum, group);
          return { value: r.toFixed(2), unit: 'kN', isValid: r > 0,
            steps: [
              { desc: '单桩承载力总和', latex: `n \\cdot R_a = ${p.n} \\times ${p.Ra} = ${sum.toFixed(2)} \\text{ kN}` },
              { desc: '考虑群效应', latex: `\\eta_g \\cdot n \\cdot R_a = ${p.eta_g} \\times ${sum.toFixed(2)} = ${group.toFixed(2)} \\text{ kN}` },
              { desc: '群桩竖向承载力（取小值）', latex: `R = \\min(${sum.toFixed(2)}, ${group.toFixed(2)}) = ${r.toFixed(2)} \\text{ kN}` }
            ]
          };
        }
      },
      {
        id: 'pile_settlement',
        name: '桩基沉降计算',
        expr: 's = \\psi \\cdot \\frac{p_0 \\cdot l \\cdot l_s}{E_s}',
        note: 'JGJ 94-2008 桩基沉降经验公式（简化）',
        params: [
          { key: 'psi', label: 'ψ', unit: '', default: 0.8 },
          { key: 'p0', label: 'p₀', unit: 'kPa', default: 100 },
          { key: 'l', label: 'l', unit: 'm', default: 5 },
          { key: 'l_s', label: 'l<sub>s</sub>', unit: 'm', default: 20 },
          { key: 'Es', label: 'E<sub>s</sub>', unit: 'MPa', default: 8 }
        ],
        scene: "估算桩基沉降，判断是否满足变形控制",
        pitfalls: ["ψ 是经验系数，按桩型查表", "Es 取桩端以下压缩层范围内的加权平均值"],
        example: { psi: 0.8, p0: 100, l: 5, l_s: 20, Es: 8 },
        calc: (p) => {
          const num = p.psi * p.p0 * p.l * p.l_s;
          const r = p.Es > 0 ? num / (p.Es * 1000) * 1000 : 0;
          return { value: r.toFixed(2), unit: 'mm', isValid: r > 0 && r < 300,
            steps: [
              { desc: '沉降经验系数', latex: `\\psi = ${p.psi}` },
              { desc: '分子', latex: `\\psi \\cdot p_0 \\cdot l \\cdot l_s = ${p.psi} \\times ${p.p0} \\times ${p.l} \\times ${p.l_s} = ${num.toFixed(2)}` },
              { desc: '桩基沉降', latex: `s = \\frac{${num.toFixed(2)}}{${p.Es}} = ${r.toFixed(2)} \\text{ mm}` }
            ]
          };
        }
      },
      {
        id: 'pile_check_base',
        name: '桩基承台底压力验算',
        expr: 'p_k = \\frac{F_k + G_k}{A} \\leq f_a',
        note: 'JGJ 94-2008 第 5.1.2 条，承台下持力层承载力验算',
        params: [
          { key: 'F_k', label: 'F<sub>k</sub>', unit: 'kN', default: 2000 },
          { key: 'G_k', label: 'G<sub>k</sub>', unit: 'kN', default: 500 },
          { key: 'A', label: 'A', unit: 'm²', default: 12.0 },
          { key: 'f_a', label: 'f<sub>a</sub>', unit: 'kPa', default: 200 }
        ],
        scene: "桩基承台下持力层承载力验算",
        pitfalls: ["A 是承台底面积，不是桩截面积之和", "Gk 包括承台自重和承台上土重", "fa 是承台底面处土的承载力（需深度修正）"],
        example: { F_k: 2000, G_k: 500, A: 12.0, f_a: 200 },
        calc: (p) => {
          const pk = (p.F_k + p.G_k) / p.A;
          return { value: pk.toFixed(2), unit: 'kPa', isValid: pk <= p.f_a,
            steps: [
              { desc: '基底平均压力', latex: `p_k = \\frac{F_k + G_k}{A} = \\frac{${p.F_k} + ${p.G_k}}{${p.A}} = ${pk.toFixed(2)} \\text{ kPa}` },
              { desc: '验算', latex: `p_k = ${pk.toFixed(2)} ${pk <= p.f_a ? '\\leq' : '>'} f_a = ${p.f_a} \\text{ kPa}${pk <= p.f_a ? '\\quad \\text{满足}' : '\\quad \\text{不满足}'}` }
            ]
          };
        }
      },
      {
        id: 'pile_neutral_point',
        name: '负摩阻力中性点深度',
        expr: 'δ_n = \\frac{l_{np}}{l} \\text{ 查表确定}',
        note: 'JGJ 94-2008 第 5.4.4 条，中性点深度系数 δn 按桩端土性查表',
        params: [
          { key: 'delta_n', label: 'δ<sub>n</sub>', unit: '', default: 0.6 },
          { key: 'l', label: 'l（桩长）', unit: 'm', default: 25 },
          { key: 'l_settle', label: 'l<sub>s</sub>（沉降层厚）', unit: 'm', default: 15 }
        ],
        scene: "确定负摩阻力中性点位置（中性点以上负摩阻，以下正摩阻）",
        pitfalls: ["中性点深度 lnep=δn·min(l, ls)", "δn 查表：黏性土 0.5~0.7，砂土 0.55~0.65", "中性点以下桩土相对位移反向，产生正摩阻力"],
        example: { delta_n: 0.6, l: 25, l_settle: 15 },
        calc: (p) => {
          const lnp = p.delta_n * Math.min(p.l, p.l_settle);
          return { value: lnp.toFixed(2), unit: 'm（中性点深度）', isValid: lnp > 0 && lnp <= p.l,
            steps: [
              { desc: '中性点深度系数', latex: `\\delta_n = ${p.delta_n}` },
              { desc: '控制深度', latex: `\\min(l, l_s) = \\min(${p.l}, ${p.l_settle}) = ${Math.min(p.l, p.l_settle)} \\text{ m}` },
              { desc: '中性点深度', latex: `l_{np} = \\delta_n \\cdot \\min(l, l_s) = ${p.delta_n} \\times ${Math.min(p.l, p.l_settle)} = ${lnp.toFixed(2)} \\text{ m}` }
            ]
          };
        }
      },
      {
        id: 'pile_cap_thickness',
        name: '承台抗冲切验算',
        expr: 'F_l \\leq 0.7 \\beta_{hp} f_{tk} \\eta h_0',
        note: 'JGJ 94-2008 第 5.9 节，承台角桩冲切（简化）',
        params: [
          { key: 'Fl', label: 'F<sub>l</sub>', unit: 'kN', default: 600 },
          { key: 'beta_hp', label: 'β<sub>hp</sub>', unit: '', default: 1.0 },
          { key: 'ftk', label: 'f<sub>tk</sub>', unit: 'kPa', default: 1570 },
          { key: 'eta', label: 'η', unit: '', default: 1.0 },
          { key: 'h0', label: 'h₀', unit: 'm', default: 0.5 }
        ],
        scene: "承台角桩冲切验算，确保承台厚度足够",
        pitfalls: ["βhp 是承台高度修正系数，h≤800mm 时=1.0", "ftk 是混凝土轴心抗拉强度标准值", "η 是冲切系数，与冲切角有关"],
        example: { Fl: 600, beta_hp: 1.0, ftk: 1570, eta: 1.0, h0: 0.5 },
        calc: (p) => {
          const capacity = 0.7 * p.beta_hp * p.ftk * p.eta * p.h0;
          return { value: capacity.toFixed(2), unit: 'kN（抗冲切能力）', isValid: p.Fl <= capacity,
            steps: [
              { desc: '桩顶冲切力', latex: `F_l = ${p.Fl} \\text{ kN}` },
              { desc: '抗冲切承载力', latex: `0.7 \\beta_{hp} f_{tk} \\eta h_0 = 0.7 \\times ${p.beta_hp} \\times ${p.ftk} \\times ${p.eta} \\times ${p.h0} = ${capacity.toFixed(2)} \\text{ kN}` },
              { desc: '验算', latex: `F_l = ${p.Fl} ${p.Fl <= capacity ? '\\leq' : '>'} ${capacity.toFixed(2)}${p.Fl <= capacity ? '\\quad \\text{满足}' : '\\quad \\text{不满足，需增大承台厚度}'}` }
            ]
          };
        }
      },
      {
        id: 'pile_spacing',
        name: '最小桩间距',
        expr: 's_{min} = 3d \\text{（摩擦桩）或 } 2.5d \\text{（端承桩）}',
        note: 'JGJ 94-2008 第 3.3.2 条',
        params: [
          { key: 'd', label: 'd（桩径）', unit: 'mm', default: 600 },
          { key: 'type', label: '桩型系数', unit: '', default: 3.0 }
        ],
        scene: "确定桩的最小中心距，type=3 摩擦桩，type=2.5 端承桩",
        pitfalls: ["摩擦桩 s≥3d，端承桩 s≥2.5d", "扩底桩 s≥1.5D（D 为扩底直径）", "承台尺寸需满足边缘距≥1.5d"],
        example: { d: 600, type: 3.0 },
        calc: (p) => {
          const r = p.type * p.d;
          return { value: r.toFixed(0), unit: 'mm（最小桩间距）', isValid: r >= p.d * 2.5,
            steps: [
              { desc: '桩径', latex: `d = ${p.d} \\text{ mm}` },
              { desc: '最小桩间距', latex: `s_{min} = ${p.type}d = ${p.type} \\times ${p.d} = ${r.toFixed(0)} \\text{ mm}` }
            ]
          };
        }
      }
    ]
  },

  // ===================== 第五章 地基处理 =====================
  {
    id: 'treatment', name: '第五章 地基处理',
    formulas: [
      {
        id: 'treat_composite_fa',
        name: '复合地基承载力',
        expr: 'f_{spk} = m \\cdot R_a / A_p + \\beta \\cdot (1-m) \\cdot f_{sk}',
        note: 'JGJ 79-2012 第 7.1.5 条',
        params: [
          { key: 'm', label: 'm', unit: '', default: 0.2 },
          { key: 'Ra', label: 'R<sub>a</sub>', unit: 'kN', default: 500 },
          { key: 'Ap', label: 'A<sub>p</sub>', unit: 'm²', default: 0.283 },
          { key: 'beta', label: 'β', unit: '', default: 0.9 },
          { key: 'f_sk', label: 'f<sub>sk</sub>', unit: 'kPa', default: 80 }
        ],
        scene: "复合地基承载力计算，最核心公式，每年必考",
        pitfalls: ["Ra 是单桩竖向承载力特征值（已除以 2），不是极限值", "β 是桩间土承载力折减系数，按规范查表", "m 是面积置换率，先算 m 再算 fspk"],
        example: { m: 0.2, Ra: 500, Ap: 0.283, beta: 0.9, f_sk: 80 },
        calc: (p) => {
          const rp = p.Ra / p.Ap;
          const sp = p.beta * (1 - p.m) * p.f_sk;
          const r = p.m * rp + sp;
          return { value: r.toFixed(2), unit: 'kPa', isValid: r > 0,
            steps: [
              { desc: '面积置换率', latex: `m = ${p.m}` },
              { desc: '桩承载力贡献', latex: `m \\cdot \\frac{R_a}{A_p} = ${p.m} \\times \\frac{${p.Ra}}{${p.Ap}} = ${(p.m*rp).toFixed(2)} \\text{ kPa}` },
              { desc: '桩间土贡献', latex: `\\beta \\cdot (1-m) \\cdot f_{sk} = ${p.beta} \\times ${(1-p.m).toFixed(3)} \\times ${p.f_sk} = ${sp.toFixed(2)} \\text{ kPa}` },
              { desc: '复合地基承载力', latex: `f_{spk} = ${(p.m*rp).toFixed(2)} + ${sp.toFixed(2)} = ${r.toFixed(2)} \\text{ kPa}` }
            ]
          };
        }
      },
      {
        id: 'treat_replace_m',
        name: '面积置换率',
        expr: 'm = \\frac{A_p}{A_e} = \\frac{d^2}{d_e^2}',
        note: 'JGJ 79-2012，d=桩径, de=等效影响直径',
        params: [
          { key: 'd', label: 'd', unit: 'mm', default: 500 },
          { key: 'de', label: 'd<sub>e</sub>', unit: 'mm', default: 1200 }
        ],
        scene: "计算面积置换率，是复合地基计算的前置步骤",
        pitfalls: ["de：正方形布桩 de=1.13s，等边三角形 de=1.05s", "m 通常 0.05~0.35，超出范围需检查"],
        example: { d: 500, de: 1200 },
        calc: (p) => {
          const r = (p.d * p.d) / (p.de * p.de);
          return { value: r.toFixed(4), unit: '', isValid: r > 0 && r < 1,
            steps: [
              { desc: '桩径', latex: `d = ${p.d} \\text{ mm}` },
              { desc: '等效影响直径', latex: `d_e = ${p.de} \\text{ mm}` },
              { desc: '面积置换率', latex: `m = \\frac{${p.d}^2}{${p.de}^2} = ${r.toFixed(4)}` }
            ]
          };
        }
      },
      {
        id: 'treat_prelod_settle',
        name: '预压固结沉降',
        expr: 'S = \\frac{a}{1 + e_0} \\cdot H_0 \\cdot \\lg\\frac{p_0 + p_z}{p_0}',
        note: 'JGJ 79-2012 第 5.2.3 条（一级简化）',
        params: [
          { key: 'a', label: 'a', unit: 'MPa⁻¹', default: 0.5 },
          { key: 'e0', label: 'e₀', unit: '', default: 1.2 },
          { key: 'H0', label: 'H₀', unit: 'm', default: 5 },
          { key: 'p0', label: 'p₀', unit: 'kPa', default: 80 },
          { key: 'pz', label: 'p<sub>z</sub>', unit: 'kPa', default: 60 }
        ],
        scene: "预压法处理软土地基的工后沉降估算",
        pitfalls: ["a/(1+e0) 是压缩指数 Cs", "lg 是以 10 为底的对数，不是自然对数 ln", "p0 是自重应力，pz 是预压荷载"],
        example: { a: 0.5, e0: 1.2, H0: 5, p0: 80, pz: 60 },
        calc: (p) => {
          const r = (p.a / (1 + p.e0)) * p.H0 * Math.log10((p.p0 + p.pz) / p.p0) * 1000;
          return { value: r.toFixed(2), unit: 'mm', isValid: r > 0 && r < 500,
            steps: [
              { desc: '压缩系数与孔隙比', latex: `\\frac{a}{1+e_0} = \\frac{${p.a}}{${(1+p.e0).toFixed(2)}} = ${(p.a/(1+p.e0)).toFixed(4)} \\text{ MPa}^{-1}` },
              { desc: '压力比', latex: `\\frac{p_0 + p_z}{p_0} = \\frac{${p.p0} + ${p.pz}}{${p.p0}} = ${((p.p0+p.pz)/p.p0).toFixed(3)}` },
              { desc: '预压固结沉降', latex: `S = ${(p.a/(1+p.e0)).toFixed(4)} \\times ${p.H0} \\times \\lg(${((p.p0+p.pz)/p.p0).toFixed(3)}) \\times 1000 = ${r.toFixed(2)} \\text{ mm}` }
            ]
          };
        }
      },
      {
        id: 'treat_consolidation_degree',
        name: '预压固结度',
        expr: 'U_t = 1 - \\frac{8}{\\pi^2} e^{-\\frac{\\pi^2 c_v t}{4 H^2}}',
        note: 'Terzaghi 一维固结理论，双面排水 H=土层厚度/2',
        params: [
          { key: 'cv', label: 'c<sub>v</sub>', unit: 'm²/年', default: 2.0 },
          { key: 't', label: 't', unit: '年', default: 1.0 },
          { key: 'H', label: 'H（排水路径）', unit: 'm', default: 5 }
        ],
        scene: "预压法固结度计算，判断预压时间是否足够",
        pitfalls: ["H 是最大排水路径：双面排水 H=土层厚/2，单面排水 H=土层厚", "cv 是竖向固结系数，由固结试验测定", "Ut≥85%~90% 方可卸载"],
        example: { cv: 2.0, t: 1.0, H: 5 },
        calc: (p) => {
          const Tv = p.cv * p.t / (4 * p.H * p.H);
          const Ut = (1 - 8 / (Math.PI * Math.PI) * Math.exp(-Math.PI * Math.PI * Tv)) * 100;
          return { value: Ut.toFixed(1), unit: '%（固结度）', isValid: Ut >= 85,
            steps: [
              { desc: '时间因数', latex: `T_v = \\frac{c_v t}{4H^2} = \\frac{${p.cv} \\times ${p.t}}{4 \\times ${p.H}^2} = ${Tv.toFixed(4)}` },
              { desc: '固结度', latex: `U_t = 1 - \\frac{8}{\\pi^2} e^{-\\pi^2 T_v} = 1 - \\frac{8}{\\pi^2} e^{-${(Math.PI*Math.PI*Tv).toFixed(4)}} = ${Ut.toFixed(1)}\\%` },
              { desc: '判定', latex: `U_t = ${Ut.toFixed(1)}\\% ${Ut >= 85 ? '\\geq 85\\% \\quad \\text{可以卸载}' : '< 85\\% \\quad \\text{需继续预压}'}` }
            ]
          };
        }
      },
      {
        id: 'treat_replace_fa',
        name: '换填垫层承载力修正',
        expr: 'f_{sp} = f_{sk} + \\eta_{db}\\gamma_m(d-0.5)',
        note: 'JGJ 79-2012 第 4.2.2 条，ηb=0, ηd=1.0',
        params: [
          { key: 'f_sk', label: 'f<sub>spk</sub>', unit: 'kPa', default: 145 },
          { key: 'eta_d', label: 'η<sub>d</sub>', unit: '', default: 1.0 },
          { key: 'gamma_m', label: 'γ<sub>m</sub>', unit: 'kN/m³', default: 18 },
          { key: 'd', label: 'd', unit: 'm', default: 2.0 }
        ],
        scene: "换填垫层处理后承载力修正",
        pitfalls: ["ηb=0、ηd=1.0 是固定值，与换填材料无关", "大面积压实填土 ηd 取值与压实系数和黏粒含量有关"],
        example: { f_sk: 145, eta_d: 1.0, gamma_m: 18, d: 2.0 },
        calc: (p) => {
          const td = p.eta_d * p.gamma_m * Math.max(p.d - 0.5, 0);
          const r = p.f_sk + td;
          return { value: r.toFixed(2), unit: 'kPa', isValid: r > 0,
            steps: [
              { desc: '垫层材料承载力特征值', latex: `f_{spk} = ${p.f_sk} \\text{ kPa}` },
              { desc: '深度修正', latex: `\\eta_d \\cdot \\gamma_m \\cdot (d-0.5) = ${p.eta_d} \\times ${p.gamma_m} \\times ${Math.max(p.d-0.5,0).toFixed(2)} = ${td.toFixed(2)} \\text{ kPa}` },
              { desc: '修正后承载力', latex: `f_{sp} = ${p.f_sk} + ${td.toFixed(2)} = ${r.toFixed(2)} \\text{ kPa}` }
            ]
          };
        }
      },
      {
        id: 'treat_replace_thickness',
        name: '换填垫层厚度计算',
        expr: 'b_z = b + 2z\\tan\\theta',
        note: 'JGJ 79-2012 第 4.2.3 条，垫层底面宽度（用于下卧层验算）',
        params: [
          { key: 'b', label: 'b', unit: 'm', default: 3.0 },
          { key: 'z', label: 'z', unit: 'm', default: 1.5 },
          { key: 'theta', label: 'θ', unit: '°', default: 28 }
        ],
        scene: "换填垫层底面宽度计算，用于下卧层验算的应力扩散",
        pitfalls: ["θ 是垫层应力扩散角：砂石 θ=30°，粉质黏土 θ=20°~25°", "z 是垫层厚度不是基础埋深", "bz 用于计算下卧层顶面附加应力"],
        example: { b: 3.0, z: 1.5, theta: 28 },
        calc: (p) => {
          const tr = p.z * Math.tan(p.theta * Math.PI / 180);
          const r = p.b + 2 * tr;
          return { value: r.toFixed(2), unit: 'm', isValid: r > p.b,
            steps: [
              { desc: '基础底面宽度', latex: `b = ${p.b} \\text{ m}` },
              { desc: '垫层扩散宽度', latex: `z \\tan\\theta = ${p.z} \\times \\tan${p.theta}° = ${tr.toFixed(3)} \\text{ m}` },
              { desc: '垫层底面宽度', latex: `b_z = ${p.b} + 2 \\times ${tr.toFixed(3)} = ${r.toFixed(2)} \\text{ m}` }
            ]
          };
        }
      },
      {
        id: 'treat_cement_mix',
        name: '水泥土搅拌桩水泥用量',
        expr: 'G_c = \\rho_c \\cdot A_p \\cdot L \\cdot \\mu_c',
        note: 'JGJ 79-2012 第 7.3 节',
        params: [
          { key: 'rho_c', label: 'ρ<sub>c</sub>', unit: 't/m³', default: 1.9 },
          { key: 'Ap', label: 'A<sub>p</sub>', unit: 'm²', default: 0.283 },
          { key: 'L', label: 'L', unit: 'm', default: 12 },
          { key: 'mu_c', label: 'μ<sub>c</sub>', unit: '', default: 0.2 }
        ],
        scene: "水泥土搅拌桩水泥用量计算，施工控制关键参数",
        pitfalls: ["μc 是水泥掺量比（通常 15%~25%）", "ρc 是水泥密度 1.9t/m³，不是水泥土密度"],
        example: { rho_c: 1.9, Ap: 0.283, L: 12, mu_c: 0.2 },
        calc: (p) => {
          const r = p.rho_c * p.Ap * p.L * p.mu_c;
          return { value: r.toFixed(3), unit: 't/根', isValid: r > 0,
            steps: [
              { desc: '水泥密度', latex: `\\rho_c = ${p.rho_c} \\text{ t/m}^3` },
              { desc: '单根桩水泥用量', latex: `G_c = ${p.rho_c} \\times ${p.Ap} \\times ${p.L} \\times ${p.mu_c} = ${r.toFixed(3)} \\text{ t/根}` }
            ]
          };
        }
      },
      {
        id: 'treat_sand_pile_s',
        name: '砂石桩/振冲桩间距',
        expr: 's = d_e \\sqrt{\\frac{\\sqrt{3}}{\\pi} \\cdot m}',
        note: 'JGJ 79-2012，等边三角形布桩（简化：s ≈ de·√m）',
        params: [
          { key: 'de', label: 'd<sub>e</sub>', unit: 'mm', default: 1200 },
          { key: 'm', label: 'm', unit: '', default: 0.15 }
        ],
        scene: "砂石桩/振冲桩设计时确定桩间距",
        pitfalls: ["等边三角形布桩系数 √(√3/π)≈0.742", "正方形布桩系数不同，需区分", "s 算出后需圆整到 50mm 的倍数"],
        example: { de: 1200, m: 0.15 },
        calc: (p) => {
          const r = p.de * Math.sqrt(Math.sqrt(3) / Math.PI * p.m);
          return { value: r.toFixed(1), unit: 'mm', isValid: r > 0,
            steps: [
              { desc: '等效影响直径', latex: `d_e = ${p.de} \\text{ mm}` },
              { desc: '面积置换率', latex: `m = ${p.m}` },
              { desc: '桩间距（等边三角形布桩）', latex: `s = d_e \\sqrt{\\frac{\\sqrt{3}}{\\pi} \\cdot m} = ${p.de} \\times \\sqrt{\\frac{\\sqrt{3}}{\\pi} \\times ${p.m}} = ${r.toFixed(1)} \\text{ mm}` }
            ]
          };
        }
      },
      {
        id: 'treat_compact_density',
        name: '灰土挤密桩处理后干密度',
        expr: '\\rho_{d0} = \\frac{\\rho_{d1} \\cdot d_1^2 + \\rho_{d2} \\cdot (d_e^2 - d_1^2)}{d_e^2}',
        note: 'JGJ 79-2012 第 9.2 节（简化：桩土共同干密度）',
        params: [
          { key: 'rho_d1', label: 'ρ<sub>d1</sub>', unit: 'g/cm³', default: 1.55 },
          { key: 'd1', label: 'd₁', unit: 'mm', default: 400 },
          { key: 'rho_d2', label: 'ρ<sub>d2</sub>', unit: 'g/cm³', default: 1.45 },
          { key: 'de', label: 'd<sub>e</sub>', unit: 'mm', default: 1100 }
        ],
        scene: "灰土挤密桩/土挤密桩处理后桩土共同干密度",
        pitfalls: ["ρd1 是桩体干密度，ρd2 是桩间土挤密后干密度", "处理后干密度需≥压实系数×最大干密度"],
        example: { rho_d1: 1.55, d1: 400, rho_d2: 1.45, de: 1100 },
        calc: (p) => {
          const r = (p.rho_d1 * p.d1 * p.d1 + p.rho_d2 * (p.de * p.de - p.d1 * p.d1)) / (p.de * p.de);
          return { value: r.toFixed(4), unit: 'g/cm³', isValid: r > 0,
            steps: [
              { desc: '桩土共同干密度', latex: `\\rho_{d0} = \\frac{${p.rho_d1} \\times ${p.d1}^2 + ${p.rho_d2} \\times (${p.de}^2 - ${p.d1}^2)}{${p.de}^2}` },
              { desc: '代入计算', latex: `= \\frac{${p.rho_d1} \\times ${(p.d1*p.d1).toFixed(0)} + ${p.rho_d2} \\times ${(p.de*p.de - p.d1*p.d1).toFixed(0)}}{${(p.de*p.de).toFixed(0)}} = ${r.toFixed(4)} \\text{ g/cm}^3` }
            ]
          };
        }
      },
      {
        id: 'treat_dynamic_compaction',
        name: '强夯处理深度（梅纳公式）',
        expr: 'd = 0.5 \\sqrt{M \\cdot h}',
        note: 'Menard 1975 经验公式，M=夯锤重(kN), h=落距(m)',
        params: [
          { key: 'M', label: 'M（夯锤重）', unit: 'kN', default: 200 },
          { key: 'h', label: 'h（落距）', unit: 'm', default: 15 }
        ],
        scene: "强夯法处理深度估算，确定夯击能是否满足要求",
        pitfalls: ["d 是理论处理深度，实际需考虑土质条件", "夯击能 E=M·h（kN·m），砂土 1000~2000，黏性土 2000~3500", "实际处理深度通常比梅纳公式小 10%~20%"],
        example: { M: 200, h: 15 },
        calc: (p) => {
          const d = 0.5 * Math.sqrt(p.M * p.h);
          const E = p.M * p.h;
          return { value: d.toFixed(2), unit: 'm（处理深度）', isValid: d > 0,
            steps: [
              { desc: '夯击能', latex: `E = M \\cdot h = ${p.M} \\times ${p.h} = ${E} \\text{ kN}\\cdot\\text{m}` },
              { desc: '处理深度（梅纳公式）', latex: `d = 0.5 \\sqrt{M \\cdot h} = 0.5 \\times \\sqrt{${E}} = ${d.toFixed(2)} \\text{ m}` }
            ]
          };
        }
      }
    ]
  },
  // ===================== 第六章 边坡工程 =====================
  {
    id: 'slope', name: '第六章 边坡',
    formulas: [
      {
        id: 'slope_infinite',
        name: '无限边坡稳定系数',
        expr: 'K_s = \\frac{c + \\gamma h \\cos\\beta \\tan\\phi}{\\gamma h \\sin\\beta}',
        note: 'GB 50330-2013 无限边坡简化法',
        params: [
          { key: 'c', label: 'c', unit: 'kPa', default: 15 },
          { key: 'phi', label: 'φ', unit: '°', default: 25 },
          { key: 'beta', label: 'β', unit: '°', default: 45 },
          { key: 'gamma', label: 'γ', unit: 'kN/m³', default: 18.5 },
          { key: 'h', label: 'h', unit: 'm', default: 8 }
        ],
        scene: "均质无限长边坡稳定性快速估算",
        pitfalls: ["角度必须转为弧度计算（×π/180）", "纯摩擦土坡 c=0，公式简化为 Ks=cotβ·tanφ", "地下水位以下用浮重度 γ'"],
        example: { c: 15, phi: 25, beta: 45, gamma: 18.5, h: 8 },
        calc: (p) => {
          const pr = p.phi * Math.PI / 180, br = p.beta * Math.PI / 180;
          const w = p.gamma * p.h;
          const driving = w * Math.sin(br);
          const resisting = p.c + w * Math.cos(br) * Math.tan(pr);
          const ks = driving > 0 ? resisting / driving : Infinity;
          return { value: ks.toFixed(3), unit: '', isValid: ks >= 1.3,
            steps: [
              { desc: '土体单位面积重量', latex: `W = \\gamma \\cdot h = ${p.gamma} \\times ${p.h} = ${w.toFixed(2)} \\text{ kN/m}^2` },
              { desc: '下滑力', latex: `W \\sin\\beta = ${w.toFixed(2)} \\times \\sin${p.beta}° = ${driving.toFixed(2)} \\text{ kN/m}^2` },
              { desc: '抗滑力', latex: `c + W \\cos\\beta \\tan\\phi = ${p.c} + ${w.toFixed(2)} \\times \\cos${p.beta}° \\times \\tan${p.phi}° = ${resisting.toFixed(2)} \\text{ kN/m}^2` },
              { desc: '稳定系数', latex: `K_s = \\frac{${resisting.toFixed(2)}}{${driving.toFixed(2)}} = ${ks.toFixed(3)}${ks >= 1.3 ? ' \\geq 1.3 \\quad \\text{稳定}' : ' < 1.3 \\quad \\text{不稳定}'}` }
            ]
          };
        }
      },
      {
        id: 'slope_swedish',
        name: '瑞典条分法（Fellenius）',
        expr: 'F_s = \\frac{\\sum (c_i l_i + W_i \\cos\\alpha_i \\tan\\phi_i)}{\\sum W_i \\sin\\alpha_i}',
        note: '瑞典条分法简化单层（忽略条间力）',
        params: [
          { key: 'ci_li', label: 'cᵢ·lᵢ', unit: 'kN', default: 80 },
          { key: 'Wi_cos_tan', label: 'Wi·cosαᵢ·tanφᵢ', unit: 'kN', default: 120 },
          { key: 'Wi_sin', label: 'Wi·sinαᵢ', unit: 'kN', default: 100 }
        ],
        scene: "瑞典条分法（最简条分法）求边坡安全系数，忽略条间力",
        pitfalls: ["瑞典条分法偏保守（偏低 5%~25%）", "实际需分多条计算后求和", "Fs≥1.3 为一级边坡要求"],
        example: { ci_li: 80, Wi_cos_tan: 120, Wi_sin: 100 },
        calc: (p) => {
          const r = (p.ci_li + p.Wi_cos_tan) / p.Wi_sin;
          return { value: r.toFixed(3), unit: '（安全系数Fs，单层简化）', isValid: r >= 1.3,
            steps: [
              { desc: '抗滑力矩（单层）', latex: `c_i l_i + W_i \\cos\\alpha_i \\tan\\phi_i = ${p.ci_li} + ${p.Wi_cos_tan} = ${(p.ci_li+p.Wi_cos_tan).toFixed(2)} \\text{ kN}` },
              { desc: '下滑力矩（单层）', latex: `W_i \\sin\\alpha_i = ${p.Wi_sin} \\text{ kN}` },
              { desc: '安全系数', latex: `F_s = \\frac{${(p.ci_li+p.Wi_cos_tan).toFixed(2)}}{${p.Wi_sin}} = ${r.toFixed(3)}${r >= 1.3 ? ' \\geq 1.3 \\quad \\text{稳定}' : ' < 1.3 \\quad \\text{不稳定}'}` }
            ]
          };
        }
      },
      {
        id: 'slope_bishop',
        name: '简化毕肖普法',
        expr: 'F_s = \\frac{\\sum (c_i b_i + (W_i - u_i) \\tan\\phi_i) / m_{\\alpha i}}{\\sum W_i \\sin\\alpha_i}',
        note: 'Bishop 1957 简化法，mαi=cosαi+sinαi·tanφi/Fs（需迭代）',
        params: [
          { key: 'ci_bi', label: 'cᵢ·bᵢ', unit: 'kN', default: 60 },
          { key: 'Wmi_tan', label: '(Wi-ui)·tanφᵢ', unit: 'kN', default: 150 },
          { key: 'mai', label: 'm<sub>αi</sub>', unit: '', default: 1.05 },
          { key: 'Wi_sin', label: 'Wi·sinαᵢ', unit: 'kN', default: 100 }
        ],
        scene: "Bishop 简化法考虑条间法向力，比瑞典法更精确（需迭代）",
        pitfalls: ["mαi 包含 Fs，需迭代求解", "Bishop 法比瑞典法高 5%~25%", "ui 是孔隙水压力，干燥土 ui=0"],
        example: { ci_bi: 60, Wmi_tan: 150, mai: 1.05, Wi_sin: 100 },
        calc: (p) => {
          const r = (p.ci_bi + p.Wmi_tan) / p.mai / p.Wi_sin;
          return { value: r.toFixed(3), unit: '（安全系数Fs，单层简化）', isValid: r >= 1.3,
            steps: [
              { desc: '抗滑力（单层）', latex: `\\frac{c_i b_i + (W_i - u_i)\\tan\\phi_i}{m_{\\alpha i}} = \\frac{${p.ci_bi} + ${p.Wmi_tan}}{${p.mai}} = ${((p.ci_bi+p.Wmi_tan)/p.mai).toFixed(2)} \\text{ kN}` },
              { desc: '下滑力（单层）', latex: `W_i \\sin\\alpha_i = ${p.Wi_sin} \\text{ kN}` },
              { desc: '安全系数', latex: `F_s = \\frac{${((p.ci_bi+p.Wmi_tan)/p.mai).toFixed(2)}}{${p.Wi_sin}} = ${r.toFixed(3)}${r >= 1.3 ? ' \\geq 1.3 \\quad \\text{稳定}' : ' < 1.3 \\quad \\text{不稳定}'}` }
            ]
          };
        }
      },
      {
        id: 'slope_polyline',
        name: '折线滑动面稳定系数',
        expr: 'F_s = \\frac{\\sum (T_i + Q_i) \\cdot \\prod \\lambda_j}{\\sum S_i}',
        note: 'GB 50330-2013 第 5.2 节，传递系数法（简化两层）',
        params: [
          { key: 'resist1', label: '抗滑力₁', unit: 'kN', default: 200 },
          { key: 'resist2', label: '抗滑力₂', unit: 'kN', default: 150 },
          { key: 'lambda', label: '传递系数 ψ', unit: '', default: 0.85 },
          { key: 'slide1', label: '下滑力₁', unit: 'kN', default: 120 },
          { key: 'slide2', label: '下滑力₂', unit: 'kN', default: 100 }
        ],
        scene: "折线滑动面（多段不同倾角）边坡稳定性计算",
        pitfalls: ["传递系数 ψ=cos(αi-αi+1)-sin(αi-αi+1)·tanφi+1/Fs", "下滑段 ψ<1，抗滑段 ψ>1", "需从坡顶向坡脚逐段传递"],
        example: { resist1: 200, resist2: 150, lambda: 0.85, slide1: 120, slide2: 100 },
        calc: (p) => {
          const num = p.resist1 + p.resist2;
          const den = p.slide1 + p.slide2 * p.lambda;
          const r = num / den;
          return { value: r.toFixed(3), unit: '（安全系数Fs，简化）', isValid: r >= 1.3,
            steps: [
              { desc: '总抗滑力', latex: `\\sum T_i = ${p.resist1} + ${p.resist2} = ${num} \\text{ kN}` },
              { desc: '传递后总下滑力', latex: `S_1 + \\psi \\cdot S_2 = ${p.slide1} + ${p.lambda} \\times ${p.slide2} = ${den.toFixed(2)} \\text{ kN}` },
              { desc: '安全系数', latex: `F_s = \\frac{${num}}{${den.toFixed(2)}} = ${r.toFixed(3)}${r >= 1.3 ? ' \\geq 1.3 \\quad \\text{稳定}' : ' < 1.3 \\quad \\text{不稳定}'}` }
            ]
          };
        }
      },
      {
        id: 'slope_taylor',
        name: 'Taylor 稳定数法',
        expr: 'm = \\frac{c}{\\gamma H F_s}',
        note: 'Taylor 图解法，用于均质黏性土坡',
        params: [
          { key: 'c', label: 'c', unit: 'kPa', default: 20 },
          { key: 'gamma', label: 'γ', unit: 'kN/m³', default: 18 },
          { key: 'H', label: 'H', unit: 'm', default: 10 },
          { key: 'F_s', label: 'F<sub>s</sub>', unit: '', default: 1.3 }
        ],
        scene: "均质黏性土坡稳定性快速判断（查 Taylor 图）",
        pitfalls: ["m 算出后需查 Taylor 稳定数图确定临界坡角", "Fs 是目标安全系数，设计时通常取 1.3"],
        example: { c: 20, gamma: 18, H: 10, F_s: 1.3 },
        calc: (p) => {
          const den = p.gamma * p.H * p.F_s;
          if (den <= 0) return { value: '—', unit: '', isValid: false, steps: [{ desc: '分母 ≤ 0', latex: '' }]};
          const m = p.c / den;
          return { value: m.toFixed(4), unit: '', isValid: m > 0,
            steps: [
              { desc: '黏聚力', latex: `c = ${p.c} \\text{ kPa}` },
              { desc: '分母', latex: `\\gamma \\cdot H \\cdot F_s = ${p.gamma} \\times ${p.H} \\times ${p.F_s} = ${den.toFixed(2)} \\text{ kPa}` },
              { desc: 'Taylor 稳定数', latex: `m = \\frac{${p.c}}{${den.toFixed(2)}} = ${m.toFixed(4)}` }
            ]
          };
        }
      },
      {
        id: 'slope_active',
        name: '主动土压力',
        expr: 'E_a = \\frac{1}{2} \\gamma H^2 K_a',
        note: 'GB 50330-2013 / GB 50007-2011 朗肯主动土压力',
        params: [
          { key: 'gamma', label: 'γ', unit: 'kN/m³', default: 18 },
          { key: 'H', label: 'H', unit: 'm', default: 5 },
          { key: 'K_a', label: 'K<sub>a</sub>', unit: '', default: 0.333 }
        ],
        scene: "挡土墙/边坡主动土压力计算，最基础公式",
        pitfalls: ["Ka=tan²(45°-φ/2)，φ 取有效内摩擦角", "有地下水时需另算静水压力，叠加", "墙后有超载 q 时：Ea=0.5γH²Ka+qH·Ka"],
        example: { gamma: 18, H: 5, K_a: 0.333 },
        calc: (p) => {
          const r = 0.5 * p.gamma * p.H * p.H * p.K_a;
          return { value: r.toFixed(2), unit: 'kN/m', isValid: r > 0,
            steps: [
              { desc: '墙后填土重度', latex: `\\gamma = ${p.gamma} \\text{ kN/m}^3` },
              { desc: '挡土墙高度平方', latex: `H^2 = ${p.H}^2 = ${(p.H*p.H).toFixed(2)} \\text{ m}^2` },
              { desc: '主动土压力', latex: `E_a = \\frac{1}{2} \\times ${p.gamma} \\times ${(p.H*p.H).toFixed(2)} \\times ${p.K_a} = ${r.toFixed(2)} \\text{ kN/m}` }
            ]
          };
        }
      },
      {
        id: 'slope_passive',
        name: '被动土压力',
        expr: 'E_p = \\frac{1}{2} \\gamma H^2 K_p + 2cH\\sqrt{K_{pc}}',
        note: 'GB 50330-2013 被动土压力（简化：Kp=Ka倒数）',
        params: [
          { key: 'gamma', label: 'γ', unit: 'kN/m³', default: 18 },
          { key: 'H', label: 'H', unit: 'm', default: 3 },
          { key: 'Kp', label: 'K<sub>p</sub>', unit: '', default: 3.0 },
          { key: 'c', label: 'c', unit: 'kPa', default: 10 },
          { key: 'Kpc', label: 'K<sub>pc</sub>', unit: '', default: 3.0 }
        ],
        scene: "挡墙前被动土压力（地基抗力）计算",
        pitfalls: ["Kp=1/Ka=tan²(45°+φ/2)", "黏聚力项 2c√Kpc 不可忽略", "被动土压力通常远大于主动土压力"],
        example: { gamma: 18, H: 3, Kp: 3.0, c: 10, Kpc: 3.0 },
        calc: (p) => {
          const r = 0.5 * p.gamma * p.H * p.H * p.Kp + 2 * p.c * p.H * Math.sqrt(p.Kpc);
          return { value: r.toFixed(2), unit: 'kN/m', isValid: r > 0,
            steps: [
              { desc: '重度项', latex: `\\frac{1}{2}\\gamma H^2 K_p = 0.5 \\times ${p.gamma} \\times ${p.H}^2 \\times ${p.Kp} = ${(0.5*p.gamma*p.H*p.H*p.Kp).toFixed(2)} \\text{ kN/m}` },
              { desc: '黏聚力项', latex: `2cH\\sqrt{K_{pc}} = 2 \\times ${p.c} \\times ${p.H} \\times \\sqrt{${p.Kpc}} = ${(2*p.c*p.H*Math.sqrt(p.Kpc)).toFixed(2)} \\text{ kN/m}` },
              { desc: '被动土压力', latex: `E_p = ${(0.5*p.gamma*p.H*p.H*p.Kp).toFixed(2)} + ${(2*p.c*p.H*Math.sqrt(p.Kpc)).toFixed(2)} = ${r.toFixed(2)} \\text{ kN/m}` }
            ]
          };
        }
      },
      {
        id: 'slope_anchor',
        name: '锚杆轴向拉力',
        expr: 'N = E_a \\cdot S_a \\cdot S_h',
        note: 'GB 50330-2013 第 8.2 节（简化：只求设计拉力）',
        params: [
          { key: 'Ea', label: 'E<sub>a</sub>', unit: 'kN/m', default: 80 },
          { key: 'Sa', label: 'S<sub>a</sub>', unit: 'm', default: 1.5 },
          { key: 'Sh', label: 'S<sub>h</sub>', unit: 'm', default: 1.0 }
        ],
        scene: "锚杆挡墙设计中求单根锚杆轴向拉力",
        pitfalls: ["Sa、Sh 是锚杆水平和竖向间距", "实际设计还需除以 cosα（锚杆倾角）和材料强度"],
        example: { Ea: 80, Sa: 1.5, Sh: 1.0 },
        calc: (p) => {
          const r = p.Ea * p.Sa * p.Sh;
          return { value: r.toFixed(2), unit: 'kN', isValid: r > 0,
            steps: [
              { desc: '主动土压力', latex: `E_a = ${p.Ea} \\text{ kN/m}` },
              { desc: '锚杆轴向拉力设计值', latex: `N = E_a \\cdot S_a \\cdot S_h = ${p.Ea} \\times ${p.Sa} \\times ${p.Sh} = ${r.toFixed(2)} \\text{ kN}` }
            ]
          };
        }
      },
      {
        id: 'slope_gravity_wall',
        name: '重力式挡墙抗滑移',
        expr: 'K_c = \\frac{\\sum G \\cdot \\mu}{\\sum E_a}',
        note: 'GB 50330-2013 第 10.2 节，Kc ≥ 1.3',
        params: [
          { key: 'G', label: '∑G', unit: 'kN', default: 200 },
          { key: 'mu', label: 'μ', unit: '', default: 0.4 },
          { key: 'Ea', label: '∑E<sub>a</sub>', unit: 'kN', default: 80 }
        ],
        scene: "重力式挡墙抗滑移稳定性验算",
        pitfalls: ["μ 是挡墙基底与地基土的摩擦系数，查表", "Kc≥1.3 是规范要求", "∑G 包括挡墙自重+墙背填土重"],
        example: { G: 200, mu: 0.4, Ea: 80 },
        calc: (p) => {
          const r = (p.G * p.mu) / p.Ea;
          return { value: r.toFixed(3), unit: '', isValid: r >= 1.3,
            steps: [
              { desc: '挡墙及土重总和', latex: `\\sum G = ${p.G} \\text{ kN}` },
              { desc: '抗滑力', latex: `\\sum G \\cdot \\mu = ${p.G} \\times ${p.mu} = ${(p.G*p.mu).toFixed(2)} \\text{ kN}` },
              { desc: '抗滑移安全系数', latex: `K_c = \\frac{${(p.G*p.mu).toFixed(2)}}{${p.Ea}} = ${r.toFixed(3)}${r >= 1.3 ? ' \\geq 1.3 \\quad \\text{满足}' : ' < 1.3 \\quad \\text{不满足}'}` }
            ]
          };
        }
      },
      {
        id: 'slope_overturn',
        name: '重力式挡墙抗倾覆',
        expr: 'K_o = \\frac{\\sum M_R}{\\sum M_O}',
        note: 'GB 50330-2013 第 10.2 节，Ko ≥ 1.6',
        params: [
          { key: 'MR', label: '∑M<sub>R</sub>', unit: 'kN·m', default: 500 },
          { key: 'MO', label: '∑M<sub>O</sub>', unit: 'kN·m', default: 200 }
        ],
        scene: "重力式挡墙抗倾覆稳定性验算",
        pitfalls: ["Ko≥1.6 是规范要求（比抗滑移更严格）", "MR、MO 都绕墙趾计算", "力矩臂容易算错，需仔细看图"],
        example: { MR: 500, MO: 200 },
        calc: (p) => {
          const r = p.MR / p.MO;
          return { value: r.toFixed(3), unit: '', isValid: r >= 1.6,
            steps: [
              { desc: '抗倾覆力矩', latex: `\\sum M_R = ${p.MR} \\text{ kN}\\cdot\\text{m}` },
              { desc: '倾覆力矩', latex: `\\sum M_O = ${p.MO} \\text{ kN}\\cdot\\text{m}` },
              { desc: '抗倾覆安全系数', latex: `K_o = \\frac{${p.MR}}{${p.MO}} = ${r.toFixed(3)}${r >= 1.6 ? ' \\geq 1.6 \\quad \\text{满足}' : ' < 1.6 \\quad \\text{不满足}'}` }
            ]
          };
        }
      },
      {
        id: 'slope_water_press',
        name: '水下边坡静水压力',
        expr: 'E_w = \\frac{1}{2} \\gamma_w h_w^2',
        note: 'GB 50330-2013，水位以下静水压力',
        params: [
          { key: 'gamma_w', label: 'γ<sub>w</sub>', unit: 'kN/m³', default: 10 },
          { key: 'hw', label: 'h<sub>w</sub>', unit: 'm', default: 4 }
        ],
        scene: "水位以下边坡/挡墙的静水压力计算",
        pitfalls: ["γw=10kN/m³", "hw 是水头高度（水面到计算点的垂直距离）", "土压力和静水压力需分别计算后叠加"],
        example: { gamma_w: 10, hw: 4 },
        calc: (p) => {
          const r = 0.5 * p.gamma_w * p.hw * p.hw;
          return { value: r.toFixed(2), unit: 'kN/m', isValid: r > 0,
            steps: [
              { desc: '静水压力', latex: `E_w = \\frac{1}{2} \\times ${p.gamma_w} \\times ${p.hw}^2 = ${r.toFixed(2)} \\text{ kN/m}` }
            ]
          };
        }
      },
      {
        id: 'slope_rankine_ka',
        name: '朗肯主动土压力系数 Ka',
        expr: 'K_a = \\tan^2(45° - \\phi/2)',
        note: '朗肯土压力理论基本公式',
        params: [
          { key: 'phi', label: 'φ', unit: '°', default: 30 }
        ],
        scene: "计算朗肯主动土压力系数 Ka，φ=30° 时 Ka=1/3",
        pitfalls: ["φ 取有效内摩擦角", "填土面水平、墙背垂直光滑时才适用", "φ=0 时 Ka=1，φ=40° 时 Ka≈0.217"],
        example: { phi: 30 },
        calc: (p) => {
          const r = Math.tan((45 - p.phi / 2) * Math.PI / 180) ** 2;
          return { value: r.toFixed(4), unit: '', isValid: r > 0 && r <= 1,
            steps: [
              { desc: '内摩擦角', latex: `\\phi = ${p.phi}°` },
              { desc: '主动土压力系数', latex: `K_a = \\tan^2(45° - ${p.phi}/2) = \\tan^2(${45-p.phi/2}°) = ${r.toFixed(4)}` }
            ]
          };
        }
      }
    ]
  },

  // ===================== 第七章 基坑工程 =====================
  {
    id: 'excavation', name: '第七章 基坑',
    formulas: [
      {
        id: 'excav_atc',
        name: '排桩/地下连续墙主动土压力',
        expr: 'e_{aj} = \\sigma_{v,j} \\cdot K_{a\\gamma} - 2c_j \\sqrt{K_{ac}}',
        note: 'JGJ 120-2012 第 4.3 节',
        params: [
          { key: 'sv', label: 'σ<sub>v</sub>', unit: 'kPa', default: 80 },
          { key: 'Ka_g', label: 'K<sub>aγ</sub>', unit: '', default: 0.4 },
          { key: 'c', label: 'c<sub>j</sub>', unit: 'kPa', default: 10 },
          { key: 'Ka_c', label: 'K<sub>ac</sub>', unit: '', default: 0.4 }
        ],
        scene: "基坑排桩/地连墙主动土压力计算（分层计算）",
        pitfalls: ["Kaγ 和 Kac 可能不同（规范推荐值）", "每层土需分别计算后叠加", "黏聚力项是减项，c 越大土压力越小"],
        example: { sv: 80, Ka_g: 0.4, c: 10, Ka_c: 0.4 },
        calc: (p) => {
          const r = p.sv * p.Ka_g - 2 * p.c * Math.sqrt(p.Ka_c);
          return { value: r.toFixed(2), unit: 'kPa', isValid: r > 0,
            steps: [
              { desc: '竖向应力项', latex: `\\sigma_v \\cdot K_{a\\gamma} = ${p.sv} \\times ${p.Ka_g} = ${(p.sv*p.Ka_g).toFixed(2)} \\text{ kPa}` },
              { desc: '黏聚力项', latex: `2c_j \\sqrt{K_{ac}} = 2 \\times ${p.c} \\times \\sqrt{${p.Ka_c}} = ${(2*p.c*Math.sqrt(p.Ka_c)).toFixed(2)} \\text{ kPa}` },
              { desc: '主动土压力', latex: `e_{aj} = ${(p.sv*p.Ka_g).toFixed(2)} - ${(2*p.c*Math.sqrt(p.Ka_c)).toFixed(2)} = ${r.toFixed(2)} \\text{ kPa}` }
            ]
          };
        }
      },
      {
        id: 'excav_water_press',
        name: '基坑渗流渗透力',
        expr: 'G_p = \\frac{\\gamma_w \\cdot h_w}{L} \\cdot V',
        note: 'JGJ 120-2012 第 4.4 节，γw=10kN/m³',
        params: [
          { key: 'gamma_w', label: 'γ<sub>w</sub>', unit: 'kN/m³', default: 10 },
          { key: 'hw', label: 'h<sub>w</sub>', unit: 'm', default: 5 },
          { key: 'L', label: 'L', unit: 'm', default: 10 },
          { key: 'V', label: 'V', unit: 'm³', default: 20 }
        ],
        scene: "基坑渗流作用下渗透力计算",
        pitfalls: ["水力梯度 i=hw/L，hw 是水头差", "渗透力方向与渗流方向一致（向上或向下）", "γw=10kN/m³"],
        example: { gamma_w: 10, hw: 5, L: 10, V: 20 },
        calc: (p) => {
          const i = p.hw / p.L;
          const r = p.gamma_w * i * p.V;
          return { value: r.toFixed(2), unit: 'kN', isValid: r > 0,
            steps: [
              { desc: '水力梯度', latex: `i = \\frac{h_w}{L} = \\frac{${p.hw}}{${p.L}} = ${i.toFixed(3)}` },
              { desc: '渗透力', latex: `G_p = \\gamma_w \\cdot i \\cdot V = ${p.gamma_w} \\times ${i.toFixed(3)} \\times ${p.V} = ${r.toFixed(2)} \\text{ kN}` }
            ]
          };
        }
      },
      {
        id: 'excav_heave',
        name: '基坑抗隆起稳定（太沙基）',
        expr: 'F_s = \\frac{c N_c + \\gamma D_f N_q}{\\gamma (D_f + D) + q}',
        note: 'JGJ 120-2012 第 4.4 节（简化）',
        params: [
          { key: 'c', label: 'c', unit: 'kPa', default: 20 },
          { key: 'Nc', label: 'N<sub>c</sub>', unit: '', default: 5.14 },
          { key: 'gamma', label: 'γ', unit: 'kN/m³', default: 18 },
          { key: 'Df', label: 'D<sub>f</sub>', unit: 'm', default: 3 },
          { key: 'Nq', label: 'N<sub>q</sub>', unit: '', default: 1.0 },
          { key: 'D', label: 'D', unit: 'm', default: 5 },
          { key: 'q', label: 'q', unit: 'kPa', default: 20 }
        ],
        scene: "基坑底部抗隆起稳定性验算（软土地基关键）",
        pitfalls: ["Nc、Nq 是承载力系数，与 φ 有关需查表", "Fs≥1.2 是 JGJ 120 要求", "Df 是坑底以下加固深度或嵌固深度"],
        example: { c: 20, Nc: 5.14, gamma: 18, Df: 3, Nq: 1.0, D: 5, q: 20 },
        calc: (p) => {
          const num = p.c * p.Nc + p.gamma * p.Df * p.Nq;
          const den = p.gamma * (p.Df + p.D) + p.q;
          if (den <= 0) return { value: '—', unit: '', isValid: false, steps: [{ desc: '分母 ≤ 0', latex: '' }]};
          const r = num / den;
          return { value: r.toFixed(3), unit: '', isValid: r >= 1.2,
            steps: [
              { desc: '抗隆起力', latex: `c N_c + \\gamma D_f N_q = ${p.c} \\times ${p.Nc} + ${p.gamma} \\times ${p.Df} \\times ${p.Nq} = ${num.toFixed(2)} \\text{ kPa}` },
              { desc: '下滑力', latex: `\\gamma(D_f + D) + q = ${p.gamma} \\times ${(p.Df+p.D).toFixed(2)} + ${p.q} = ${den.toFixed(2)} \\text{ kPa}` },
              { desc: '抗隆起安全系数', latex: `F_s = \\frac{${num.toFixed(2)}}{${den.toFixed(2)}} = ${r.toFixed(3)}${r >= 1.2 ? ' \\geq 1.2 \\quad \\text{满足}' : ' < 1.2 \\quad \\text{不满足}'}` }
            ]
          };
        }
      },
      {
        id: 'excav_anchor_len',
        name: '锚杆锚固段长度',
        expr: 'L_a = \\frac{N}{\\pi d_f [\\sigma] \\cdot \\eta}',
        note: 'GB 50330-2013 第 8.2 节，N=锚杆轴向拉力设计值',
        params: [
          { key: 'N', label: 'N', unit: 'kN', default: 200 },
          { key: 'df', label: 'd<sub>f</sub>', unit: 'm', default: 0.05 },
          { key: 'sigma', label: '[σ]', unit: 'MPa', default: 2.0 },
          { key: 'eta', label: 'η', unit: '', default: 0.85 }
        ],
        scene: "锚杆锚固段长度设计",
        pitfalls: ["[σ] 是锚固体与土体的粘结强度设计值，单位 MPa 需×1000 转 kPa", "η 是锚杆工作条件系数", "df 是锚固体直径（不是钢筋直径）"],
        example: { N: 200, df: 0.05, sigma: 2.0, eta: 0.85 },
        calc: (p) => {
          const den = Math.PI * p.df * p.sigma * 1000 * p.eta;
          if (den <= 0) return { value: '—', unit: 'm', isValid: false, steps: [{ desc: '分母 ≤ 0', latex: '' }]};
          const r = p.N / den;
          return { value: r.toFixed(2), unit: 'm', isValid: r > 0,
            steps: [
              { desc: '锚杆轴向拉力', latex: `N = ${p.N} \\text{ kN}` },
              { desc: '锚固段长度', latex: `L_a = \\frac{${p.N}}{\\pi \\times ${p.df} \\times ${p.sigma} \\times 1000 \\times ${p.eta}} = ${r.toFixed(2)} \\text{ m}` }
            ]
          };
        }
      },
      {
        id: 'excav_pile_moment',
        name: '排桩弯矩（简支梁简化）',
        expr: 'M_{max} = \\frac{q \\cdot h^2}{8}',
        note: 'JGJ 120-2012 排桩内力简化估算（单跨简支梁模型）',
        params: [
          { key: 'q', label: 'q', unit: 'kN/m', default: 40 },
          { key: 'h', label: 'h', unit: 'm', default: 6 }
        ],
        scene: "排桩最大弯矩简化估算",
        pitfalls: ["这是简支梁简化，实际是超静定结构", "q 是等效均布荷载（土压力合力/高度）", "实际设计需用 m 法或有限元"],
        example: { q: 40, h: 6 },
        calc: (p) => {
          const r = p.q * p.h * p.h / 8;
          return { value: r.toFixed(2), unit: 'kN·m', isValid: r > 0,
            steps: [
              { desc: '均布荷载', latex: `q = ${p.q} \\text{ kN/m}` },
              { desc: '最大弯矩（简化）', latex: `M_{max} = \\frac{${p.q} \\times ${p.h}^2}{8} = ${r.toFixed(2)} \\text{ kN}\\cdot\\text{m}` }
            ]
          };
        }
      },
      {
        id: 'excav_well_discharge',
        name: '降水井出水量',
        expr: 'Q = \\frac{1.366 k (2H - S) S}{\\lg R - \\lg r_0}',
        note: 'JGJ 120-2012 第 7.2 节，完整井抽水（承压含水层）',
        params: [
          { key: 'k', label: 'k', unit: 'm/d', default: 5 },
          { key: 'H', label: 'H（含水层厚）', unit: 'm', default: 15 },
          { key: 'S', label: 'S（降深）', unit: 'm', default: 8 },
          { key: 'R', label: 'R（影响半径）', unit: 'm', default: 200 },
          { key: 'r0', label: 'r₀（井半径）', unit: 'm', default: 0.15 }
        ],
        scene: "基坑降水单井出水量计算，确定水泵选型",
        pitfalls: ["k 单位 m/d，结果 Q 单位 m³/d", "非完整井需乘以修正系数", "R 用经验公式估算（如 2S√(kH)）"],
        example: { k: 5, H: 15, S: 8, R: 200, r0: 0.15 },
        calc: (p) => {
          const r = 1.366 * p.k * (2 * p.H - p.S) * p.S / (Math.log10(p.R) - Math.log10(p.r0));
          return { value: r.toFixed(1), unit: 'm³/d', isValid: r > 0,
            steps: [
              { desc: '渗透系数', latex: `k = ${p.k} \\text{ m/d}` },
              { desc: '水头项', latex: `(2H - S) \\cdot S = (2 \\times ${p.H} - ${p.S}) \\times ${p.S} = ${((2*p.H-p.S)*p.S).toFixed(1)} \\text{ m}^2` },
              { desc: '对数项', latex: `\\lg R - \\lg r_0 = \\lg${p.R} - \\lg${p.r0} = ${(Math.log10(p.R)-Math.log10(p.r0)).toFixed(3)}` },
              { desc: '单井出水量', latex: `Q = \\frac{1.366 \\times ${p.k} \\times ${((2*p.H-p.S)*p.S).toFixed(1)}}{${(Math.log10(p.R)-Math.log10(p.r0)).toFixed(3)}} = ${r.toFixed(1)} \\text{ m}^3\\text{/d}` }
            ]
          };
        }
      },
      {
        id: 'excav_seepage_stability',
        name: '基坑渗透稳定验算',
        expr: 'K = \\frac{i_c}{i} = \\frac{c\\phi}{\\gamma\\prime \\cdot L}',
        note: 'JGJ 120-2012 第 7.3 节，临界水力梯度 ic=cφ，K≥1.5~2.0',
        params: [
          { key: 'ic', label: 'i<sub>c</sub>（临界梯度）', unit: '', default: 1.0 },
          { key: 'i', label: 'i（实际梯度）', unit: '', default: 0.5 },
          { key: 'L', label: 'L（渗流路径）', unit: 'm', default: 8 }
        ],
        scene: "基坑底部渗透稳定性验算（管涌/流土）",
        pitfalls: ["K≥1.5（一般）或≥2.0（重要工程）", "ic 由试验测定，砂土约 0.8~1.2", "i=水头差/渗流路径长度"],
        example: { ic: 1.0, i: 0.5, L: 8 },
        calc: (p) => {
          const r = p.ic / p.i;
          return { value: r.toFixed(3), unit: '（渗透稳定安全系数）', isValid: r >= 1.5,
            steps: [
              { desc: '临界水力梯度', latex: `i_c = ${p.ic}` },
              { desc: '实际水力梯度', latex: `i = ${p.i}` },
              { desc: '渗透稳定安全系数', latex: `K = \\frac{i_c}{i} = \\frac{${p.ic}}{${p.i}} = ${r.toFixed(3)}${r >= 1.5 ? ' \\geq 1.5 \\quad \\text{稳定}' : ' < 1.5 \\quad \\text{不稳定，需加固或加深帷幕}'}` }
            ]
          };
        }
      },
      {
        id: 'excav_horizontal_load',
        name: '基坑水平荷载（水压力+土压力）',
        expr: 'E = E_a + E_w = \\frac{1}{2}\\gamma H^2 K_a + \\frac{1}{2}\\gamma_w h_w^2',
        note: 'JGJ 120-2012 第 4.3 节，土压力与静水压力叠加',
        params: [
          { key: 'gamma', label: 'γ', unit: 'kN/m³', default: 18 },
          { key: 'H', label: 'H', unit: 'm', default: 6 },
          { key: 'Ka', label: 'K<sub>a</sub>', unit: '', default: 0.333 },
          { key: 'gamma_w', label: 'γ<sub>w</sub>', unit: 'kN/m³', default: 10 },
          { key: 'hw', label: 'h<sub>w</sub>', unit: 'm', default: 3 }
        ],
        scene: "基坑支护结构水平荷载计算（土压力+水压力）",
        pitfalls: ["有地下水时：土压力用浮重度 γ'，水压力单独算", "无地下水时：Ew=0，用天然重度 γ", "超载 q 也产生水平力 qH·Ka"],
        example: { gamma: 18, H: 6, Ka: 0.333, gamma_w: 10, hw: 3 },
        calc: (p) => {
          const Ea = 0.5 * p.gamma * p.H * p.H * p.Ka;
          const Ew = 0.5 * p.gamma_w * p.hw * p.hw;
          const r = Ea + Ew;
          return { value: r.toFixed(2), unit: 'kN/m', isValid: r > 0,
            steps: [
              { desc: '主动土压力', latex: `E_a = \\frac{1}{2} \\times ${p.gamma} \\times ${p.H}^2 \\times ${p.Ka} = ${Ea.toFixed(2)} \\text{ kN/m}` },
              { desc: '静水压力', latex: `E_w = \\frac{1}{2} \\times ${p.gamma_w} \\times ${p.hw}^2 = ${Ew.toFixed(2)} \\text{ kN/m}` },
              { desc: '总水平荷载', latex: `E = ${Ea.toFixed(2)} + ${Ew.toFixed(2)} = ${r.toFixed(2)} \\text{ kN/m}` }
            ]
          };
        }
      }
    ]
  },
  // ===================== 第八章 特殊性岩土 =====================
  {
    id: 'special', name: '第八章 特殊土',
    formulas: [
      {
        id: 'special_collapse',
        name: '湿陷性黄土湿陷量计算',
        expr: '\\delta_z = \\sum_{i=1}^{n} \\delta_{zi} \\cdot H_i',
        note: 'GB 50025-2018 第 4.4 节，δzi=湿陷系数',
        params: [
          { key: 'delta_zi', label: 'δ<sub>zi</sub>', unit: '', default: 0.015 },
          { key: 'Hi', label: 'H<sub>i</sub>', unit: 'mm', default: 500 }
        ],
        scene: "湿陷性黄土地区湿陷量计算",
        pitfalls: ["δzi 是湿陷系数，由试验测定", "Hi 单位是 mm 不是 m", "多层需累加，总湿陷量≥150mm 为湿陷性黄土"],
        example: { delta_zi: 0.015, Hi: 500 },
        calc: (p) => {
          const r = p.delta_zi * p.Hi;
          return { value: r.toFixed(2), unit: 'mm（单层）', isValid: r >= 0,
            steps: [
              { desc: '湿陷系数', latex: `\\delta_{zi} = ${p.delta_zi}` },
              { desc: '土层厚度', latex: `H_i = ${p.Hi} \\text{ mm}` },
              { desc: '该层湿陷量', latex: `\\delta_z = ${p.delta_zi} \\times ${p.Hi} = ${r.toFixed(2)} \\text{ mm}` }
            ]
          };
        }
      },
      {
        id: 'special_collapse_grade',
        name: '湿陷等级判定',
        expr: '按 \\Delta_z 和 \\delta_{zs} 划分：甲/乙/丙/丁级',
        note: 'GB 50025-2018 第 4.4.5 条，Δz=累计湿陷量，δzs=自重湿陷系数',
        params: [
          { key: 'Delta_z', label: 'Δz（累计湿陷量）', unit: 'mm', default: 200 },
          { key: 'delta_zs_sum', label: 'ΣδzsH（自重湿陷）', unit: 'mm', default: 70 }
        ],
        scene: "根据累计湿陷量和自重湿陷量判定湿陷等级（甲/乙/丙/丁）",
        pitfalls: ["Δz<150 且 ΣδzsH<70 → 非湿陷性", "Δz≥150 且 <300，ΣδzsH≥70 → 乙级", "≥300 或 ΣδzsH很大 → 丙级/丁级", "判定表需严格按规范查"],
        example: { Delta_z: 200, delta_zs_sum: 70 },
        calc: (p) => {
          let grade;
          if (p.Delta_z < 150 || p.delta_zs_sum < 70) {
            grade = '非湿陷性或轻微';
          } else if (p.Delta_z < 300 && p.delta_zs_sum < 200) {
            grade = '乙级（中等）';
          } else if (p.Delta_z < 700 && p.delta_zs_sum < 500) {
            grade = '丙级（较重）';
          } else {
            grade = '丁级（严重）';
          }
          return { value: p.Delta_z.toFixed(0), unit: `mm（${grade}）`, isValid: p.Delta_z < 150,
            steps: [
              { desc: '累计湿陷量', latex: `\\Delta_z = ${p.Delta_z} \\text{ mm}` },
              { desc: '自重湿陷量', latex: `\\sum \\delta_{zs} H = ${p.delta_zs_sum} \\text{ mm}` },
              { desc: '湿陷等级', latex: `\\Delta_z = ${p.Delta_z}, \\quad \\sum\\delta_{zs}H = ${p.delta_zs_sum} \\rightarrow \\text{${grade}}` }
            ]
          };
        }
      },
      {
        id: 'special_swell_deformation',
        name: '膨胀土膨胀变形量',
        expr: 's = \\sum s_i = \\sum \\beta \\cdot \\varepsilon_{shi} \\cdot h_i',
        note: 'GB 50112-2013 第 5.2 节，β=膨胀率修正系数',
        params: [
          { key: 'beta', label: 'β', unit: '', default: 0.5 },
          { key: 'epsi', label: 'ε<sub>shi</sub>', unit: '%', default: 3.0 },
          { key: 'hi', label: 'h<sub>i</sub>', unit: 'mm', default: 1000 }
        ],
        scene: "膨胀土地区基础膨胀变形量估算",
        pitfalls: ["β 按基础类型查表：刚性基础 0.5，柔性基础 1.0", "εshi 是自由膨胀率，由试验测定", "h_i 单位 mm"],
        example: { beta: 0.5, epsi: 3.0, hi: 1000 },
        calc: (p) => {
          const r = p.beta * p.epsi / 100 * p.hi;
          return { value: r.toFixed(2), unit: 'mm（单层）', isValid: r >= 0,
            steps: [
              { desc: '自由膨胀率', latex: `\\varepsilon_{shi} = ${p.epsi}\\%` },
              { desc: '修正系数', latex: `\\beta = ${p.beta}` },
              { desc: '膨胀变形量', latex: `s_i = \\beta \\cdot \\varepsilon_{shi} \\cdot h_i = ${p.beta} \\times \\frac{${p.epsi}}{100} \\times ${p.hi} = ${r.toFixed(2)} \\text{ mm}` }
            ]
          };
        }
      },
      {
        id: 'special_swell_force',
        name: '膨胀土膨胀力',
        expr: 'P_e = P_{zs} + \\frac{P_{zr} - P_{zs}}{\\theta_r - \\theta_s}(\\theta - \\theta_s)',
        note: 'GB 50112-2013（简化：直接查表或经验公式）',
        params: [
          { key: 'Pe', label: 'P<sub>e</sub>', unit: 'kPa', default: 200 },
          { key: 'w_n', label: 'w<sub>n</sub>', unit: '%', default: 25 },
          { key: 'Ip', label: 'I<sub>p</sub>', unit: '', default: 20 }
        ],
        scene: "膨胀土地区膨胀力估算",
        pitfalls: ["此为简化经验公式，非规范标准公式", "实际膨胀力由室内试验测定", "含水量对膨胀力影响很大"],
        example: { Pe: 200, w_n: 25, Ip: 20 },
        calc: (p) => {
          const r = p.Pe * (1 - 0.02 * (p.w_n - 20));
          return { value: r.toFixed(2), unit: 'kPa', isValid: r > 0,
            steps: [
              { desc: '天然膨胀力', latex: `P_e = ${p.Pe} \\text{ kPa}` },
              { desc: '天然含水量修正', latex: `修正系数 = 1 - 0.02 \\times (${p.w_n} - 20) = ${(1-0.02*(p.w_n-20)).toFixed(3)}` },
              { desc: '修正后膨胀力', latex: `P_e = ${p.Pe} \\times ${(1-0.02*(p.w_n-20)).toFixed(3)} = ${r.toFixed(2)} \\text{ kPa}` }
            ]
          };
        }
      },
      {
        id: 'special_salt_bearing',
        name: '盐渍土承载力折减',
        expr: 'f_a = \\psi_s \\cdot f_{a0}',
        note: 'GB 50007-2011 附录 N，ψs=盐渍土折减系数',
        params: [
          { key: 'fa0', label: 'f<sub>a0</sub>', unit: 'kPa', default: 180 },
          { key: 'psi_s', label: 'ψ<sub>s</sub>', unit: '', default: 0.8 },
          { key: 'salt', label: '含盐量', unit: '%', default: 1.5 }
        ],
        scene: "盐渍土地区地基承载力需乘以折减系数",
        pitfalls: ["ψs 按含盐量和土类查表", "硫酸盐型盐渍土折减更严重", "氯化物型盐渍土腐蚀性更强"],
        example: { fa0: 180, psi_s: 0.8, salt: 1.5 },
        calc: (p) => {
          const r = p.psi_s * p.fa0;
          return { value: r.toFixed(2), unit: 'kPa', isValid: r > 0,
            steps: [
              { desc: '非盐渍土承载力', latex: `f_{a0} = ${p.fa0} \\text{ kPa}` },
              { desc: '盐渍土折减系数', latex: `\\psi_s = ${p.psi_s} \\quad (含盐量 ${p.salt}\\%)` },
              { desc: '折减后承载力', latex: `f_a = ${p.psi_s} \\times ${p.fa0} = ${r.toFixed(2)} \\text{ kPa}` }
            ]
          };
        }
      },
      {
        id: 'special_frost_depth',
        name: '冻土冻深计算',
        expr: 'd_f = \\lambda \\cdot d_{wm} \\cdot \\sqrt[3]{h}',
        note: 'GB 50007-2011 附录 R（简化经验公式）',
        params: [
          { key: 'lambda', label: 'λ', unit: '', default: 0.85 },
          { key: 'dwm', label: 'd<sub>wm</sub>', unit: 'm', default: 1.2 },
          { key: 'h', label: 'h（负温持续期）', unit: '月', default: 4 }
        ],
        scene: "冻土地区设计冻深估算，确定基础最小埋深",
        pitfalls: ["λ 是土的热特性系数，查表", "dw m 是标准冻结深度", "基础埋深应大于设计冻深"],
        example: { lambda: 0.85, dwm: 1.2, h: 4 },
        calc: (p) => {
          const r = p.lambda * p.dwm * Math.pow(p.h, 1/3);
          return { value: r.toFixed(3), unit: 'm（设计冻深）', isValid: r > 0,
            steps: [
              { desc: '土的热特性系数', latex: `\\lambda = ${p.lambda}` },
              { desc: '标准冻结深度', latex: `d_{wm} = ${p.dwm} \\text{ m}` },
              { desc: '设计冻深', latex: `d_f = ${p.lambda} \\times ${p.dwm} \\times \\sqrt[3]{${p.h}} = ${r.toFixed(3)} \\text{ m}` }
            ]
          };
        }
      },
      {
        id: 'special_soft_soil',
        name: '软土判定（天然含水量）',
        expr: 'w_L = 0.73 + 0.45w_n - 0.08I_P',
        note: '软土：w≥wL 且 e≥1.0 的饱和黏性土',
        params: [
          { key: 'wn', label: 'w<sub>n</sub>', unit: '%', default: 40 },
          { key: 'Ip', label: 'I<sub>p</sub>', unit: '', default: 15 },
          { key: 'w', label: 'w', unit: '%', default: 45 },
          { key: 'e', label: 'e', unit: '', default: 1.2 }
        ],
        scene: "软土判定",
        pitfalls: ["液限 wL 实际由 Casagrande 试验测定，非计算值", "软土判定还需满足 e≥1.0 且饱和", "此为简化估算，仅供参考"],
        example: { wn: 40, Ip: 15, w: 45, e: 1.2 },
        calc: (p) => {
          const wL = 0.73 + 0.45 * p.wn / 100 - 0.08 * p.Ip / 100;
          const wL_pct = wL * 100;
          const isSoft = p.w >= wL_pct && p.e >= 1.0;
          return { value: wL_pct.toFixed(1), unit: '%（液限wL）', isValid: isSoft,
            steps: [
              { desc: '液限计算', latex: `w_L = (0.73 + 0.45 \\times ${p.wn} - 0.08 \\times ${p.Ip})\\% = ${wL_pct.toFixed(1)}\\%` },
              { desc: '判定', latex: `w = ${p.w}\\% ${p.w >= wL_pct ? '\\geq' : '<'} w_L = ${wL_pct.toFixed(1)}\\%${p.w >= wL_pct ? ', \\quad e = ' + p.e + ' \\geq 1.0' : ''}` },
              { desc: '结论', latex: isSoft ? '\\text{属于软土}' : '\\text{不属于软土}' }
            ]
          };
        }
      },
      {
        id: 'special_collapse_coeff',
        name: '湿陷系数判定',
        expr: '\\delta_s = \\frac{h_1 - h_2}{h_0}',
        note: 'GB 50025-2018，δs≥0.015 为湿陷性黄土',
        params: [
          { key: 'h0', label: 'h₀（初始高度）', unit: 'mm', default: 20 },
          { key: 'h1', label: 'h₁（浸水后高度）', unit: 'mm', default: 19.5 },
          { key: 'h2', label: 'h₂（加压后高度）', unit: 'mm', default: 18.8 }
        ],
        scene: "湿陷系数试验计算，δs≥0.015 判定为湿陷性黄土",
        pitfalls: ["h0 是天然状态试件高度", "h1 是浸水饱和后高度（200kPa 下）", "h2 是加压至 200kPa 稳定后高度"],
        example: { h0: 20, h1: 19.5, h2: 18.8 },
        calc: (p) => {
          const ds = (p.h1 - p.h2) / p.h0;
          const isCollapse = ds >= 0.015;
          return { value: ds.toFixed(4), unit: '', isValid: !isCollapse,
            steps: [
              { desc: '初始高度', latex: `h_0 = ${p.h0} \\text{ mm}` },
              { desc: '浸水后高度差', latex: `h_1 - h_2 = ${p.h1} - ${p.h2} = ${(p.h1-p.h2).toFixed(2)} \\text{ mm}` },
              { desc: '湿陷系数', latex: `\\delta_s = \\frac{${(p.h1-p.h2).toFixed(2)}}{${p.h0}} = ${ds.toFixed(4)}` },
              { desc: '判定', latex: `\\delta_s = ${ds.toFixed(4)} ${isCollapse ? '\\geq' : '<'} 0.015${isCollapse ? '\\quad \\text{湿陷性黄土}' : '\\quad \\text{非湿陷性}'}` }
            ]
          };
        }
      }
    ]
  },

  // ===================== 第九章 地震工程 =====================
  {
    id: 'seismic', name: '第九章 抗震',
    formulas: [
      {
        id: 'seismic_liquefaction',
        name: '砂土液化判别（标准贯入）',
        expr: 'N_{cr} = N_0 \\cdot \\frac{3}{\\rho_c + 1.5} \\cdot \\frac{d_w}{d_b}',
        note: 'GB 50011-2010 第 4.3.4 条（简化）',
        params: [
          { key: 'N', label: 'N（实测）', unit: '击', default: 12 },
          { key: 'N0', label: 'N<sub>0</sub>', unit: '击', default: 15 },
          { key: 'rho_c', label: 'ρ<sub>c</sub>', unit: '%', default: 30 },
          { key: 'dw', label: 'd<sub>w</sub>', unit: 'm', default: 2 },
          { key: 'db', label: 'd<sub>b</sub>', unit: 'm', default: 3 }
        ],
        scene: "砂土液化判别，抗震设计必做",
        pitfalls: ["Ncr 修正公式中 ρc 是黏粒含量（%）", "dw 是地下水位深度，db 是判别深度", "N<Ncr 判定为液化，N≥Ncr 不液化"],
        example: { N: 12, N0: 15, rho_c: 30, dw: 2, db: 3 },
        calc: (p) => {
          const Ncr = p.N0 * (3 / (p.rho_c + 1.5)) * (p.dw / p.db);
          const isLiquefy = p.N < Ncr;
          return { value: Ncr.toFixed(2), unit: '击（临界值Ncr）', isValid: !isLiquefy,
            steps: [
              { desc: '实测标准贯入锤击数', latex: `N = ${p.N} \\text{ 击}` },
              { desc: '临界锤击数修正', latex: `N_{cr} = ${p.N0} \\times \\frac{3}{${p.rho_c} + 1.5} \\times \\frac{${p.dw}}{${p.db}} = ${Ncr.toFixed(2)} \\text{ 击}` },
              { desc: '判别', latex: `N = ${p.N} ${isLiquefy ? '<' : '\\geq'} N_{cr} = ${Ncr.toFixed(2)}${isLiquefy ? '\\quad \\text{液化}' : '\\quad \\text{不液化}'}` }
            ]
          };
        }
      },
      {
        id: 'seismic_bearing_adj',
        name: '抗震承载力调整',
        expr: 'f_{aE} = \\zeta_a \\cdot f_a',
        note: 'GB 50011-2010 第 4.2.5 条，ζa=抗震调整系数',
        params: [
          { key: 'fa', label: 'f<sub>a</sub>', unit: 'kPa', default: 200 },
          { key: 'za', label: 'ζ<sub>a</sub>', unit: '', default: 1.1 }
        ],
        scene: "抗震设防时地基承载力可提高 ζa 倍",
        pitfalls: ["ζa 按抗震设防烈度查表：7度=1.1, 8度=1.2, 9度=1.3", "仅适用于抗震验算，正常设计不能用 ζa"],
        example: { fa: 200, za: 1.1 },
        calc: (p) => {
          const r = p.za * p.fa;
          return { value: r.toFixed(2), unit: 'kPa', isValid: r > p.fa,
            steps: [
              { desc: '修正后承载力', latex: `f_a = ${p.fa} \\text{ kPa}` },
              { desc: '抗震调整系数', latex: `\\zeta_a = ${p.za}` },
              { desc: '抗震承载力', latex: `f_{aE} = ${p.za} \\times ${p.fa} = ${r.toFixed(2)} \\text{ kPa}` }
            ]
          };
        }
      },
      {
        id: 'seismic_liquefaction_idx',
        name: '场地液化指数',
        expr: 'I_{lE} = \\sum_{i=1}^{n} (1 - \\frac{N_i}{N_{cr,i}}) \\cdot W_i',
        note: 'GB 50011-2010 第 4.3.5 条（简化单层）',
        params: [
          { key: 'Ni', label: 'N<sub>i</sub>', unit: '击', default: 10 },
          { key: 'Ncri', label: 'N<sub>cr,i</sub>', unit: '击', default: 15 },
          { key: 'Wi', label: 'W<sub>i</sub>', unit: '', default: 10 }
        ],
        scene: "计算场地液化指数，划分液化等级",
        pitfalls: ["Ni≥Ncri 的层不参与计算（该项为 0）", "Wil 是权重函数，与深度有关（越深权重越小）", "IlE≤6 轻微，6~15 中等，>15 严重"],
        example: { Ni: 10, Ncri: 15, Wi: 10 },
        calc: (p) => {
          if (p.Ni >= p.Ncri) return { value: '0', unit: '', isValid: true,
            steps: [{ desc: 'N ≥ Ncr，该层不液化', latex: `I_{lE} = 0` }]};
          const r = (1 - p.Ni / p.Ncri) * p.Wi;
          let grade = r <= 6 ? '不液化或轻微' : r <= 15 ? '中等' : '严重';
          return { value: r.toFixed(2), unit: `（${grade}）`, isValid: r <= 6,
            steps: [
              { desc: '实测与临界值差', latex: `1 - \\frac{${p.Ni}}{${p.Ncri}} = ${(1-p.Ni/p.Ncri).toFixed(4)}` },
              { desc: '场地液化指数（单层）', latex: `I_{lE} = ${(1-p.Ni/p.Ncri).toFixed(4)} \\times ${p.Wi} = ${r.toFixed(2)}` },
              { desc: '液化等级', latex: `I_{lE} = ${r.toFixed(2)} \\rightarrow \\text{${grade}}` }
            ]
          };
        }
      },
      {
        id: 'seismic_spectra_accel',
        name: '水平地震影响系数',
        expr: '\\alpha = \\left(\\frac{T_g}{T}\\right)^{\\nu} \\eta_2 \\alpha_{max}',
        note: 'GB 50011-2010 第 5.1.4 条（T ≤ Tg 时 α = η₂·αmax）',
        params: [
          { key: 'Tg', label: 'T<sub>g</sub>', unit: 's', default: 0.35 },
          { key: 'T', label: 'T', unit: 's', default: 0.5 },
          { key: 'nu', label: 'ν', unit: '', default: 0.9 },
          { key: 'eta2', label: 'η₂', unit: '', default: 1.0 },
          { key: 'alpha_max', label: 'α<sub>max</sub>', unit: '', default: 0.16 }
        ],
        scene: "地震影响系数曲线计算，抗震设计核心参数",
        pitfalls: ["T≤Tg 时 α=η₂·αmax（水平段）", "T>Tg 时 α 按衰减段公式计算", "ν 衰减指数通常取 0.9"],
        example: { Tg: 0.35, T: 0.5, nu: 0.9, eta2: 1.0, alpha_max: 0.16 },
        calc: (p) => {
          let r;
          let stepFormula;
          if (p.T <= p.Tg) {
            r = p.eta2 * p.alpha_max;
            stepFormula = `T = ${p.T} \\leq T_g = ${p.Tg}，取 \\alpha = \\eta_2 \\cdot \\alpha_{max} = ${p.eta2} \\times ${p.alpha_max} = ${r.toFixed(4)}`;
          } else {
            r = Math.pow(p.Tg / p.T, p.nu) * p.eta2 * p.alpha_max;
            stepFormula = `T = ${p.T} > T_g = ${p.Tg}，\\alpha = \\left(\\frac{${p.Tg}}{${p.T}}\\right)^{${p.nu}} \\times ${p.eta2} \\times ${p.alpha_max} = ${r.toFixed(4)}`;
          }
          return { value: r.toFixed(4), unit: '', isValid: r > 0,
            steps: [
              { desc: '特征周期与自振周期比较', latex: `T_g = ${p.Tg} \\text{ s}, \\quad T = ${p.T} \\text{ s}` },
              { desc: '水平地震影响系数', latex: stepFormula }
            ]
          };
        }
      },
      {
        id: 'seismic_base_shear',
        name: '底部剪力法',
        expr: 'F_{Ek} = \\alpha_1 \\cdot 0.85 \\cdot G_{eq}',
        note: 'GB 50011-2010 第 5.2.1 条，Geq=0.85G（多质点）或0.75G（单质点）',
        params: [
          { key: 'alpha1', label: 'α₁', unit: '', default: 0.08 },
          { key: 'Geq', label: 'G<sub>eq</sub>', unit: 'kN', default: 15000 },
          { key: 'coef', label: '系数', unit: '', default: 0.85 }
        ],
        scene: "底部剪力法求结构总地震作用",
        pitfalls: ["Geq=0.85G（多质点）或 0.75G（单质点）", "仅适用于高度≤40m 的规则结构", "α₁ 按 T 和 Tg 从反应谱查得"],
        example: { alpha1: 0.08, Geq: 15000, coef: 0.85 },
        calc: (p) => {
          const r = p.alpha1 * p.coef * p.Geq;
          return { value: r.toFixed(2), unit: 'kN', isValid: r > 0,
            steps: [
              { desc: '重力代表值', latex: `G_{eq} = ${p.Geq} \\text{ kN}` },
              { desc: '底部剪力', latex: `F_{Ek} = \\alpha_1 \\cdot ${p.coef} \\cdot G_{eq} = ${p.alpha1} \\times ${p.coef} \\times ${p.Geq} = ${r.toFixed(2)} \\text{ kN}` }
            ]
          };
        }
      },
      {
        id: 'seismic_site_class',
        name: '场地类别判定',
        expr: '按 v_s 和覆盖层厚度 d₀ 查表',
        note: 'GB 50011-2010 第 4.1.6 条，vs=等效剪切波速',
        params: [
          { key: 'vs', label: 'v<sub>s</sub>（等效剪切波速）', unit: 'm/s', default: 250 },
          { key: 'd0', label: 'd₀（覆盖层厚度）', unit: 'm', default: 30 }
        ],
        scene: "根据等效剪切波速和覆盖层厚度判定场地类别（Ⅰ~Ⅳ类）",
        pitfalls: ["vs>500 为坚硬场地土，150~500 中硬，250~400 中等，<150 软弱", "覆盖层厚度 d₀<5m 为Ⅰ₀类，>80m 为Ⅳ类", "场地类别直接影响 Tg 和地震作用"],
        example: { vs: 250, d0: 30 },
        calc: (p) => {
          let siteClass;
          if (p.vs > 500) {
            siteClass = p.d0 <= 5 ? 'Ⅰ₀' : p.d0 <= 40 ? 'Ⅰ₁' : p.d0 <= 80 ? 'Ⅱ' : 'Ⅲ';
          } else if (p.vs >= 250) {
            siteClass = p.d0 <= 5 ? 'Ⅰ₁' : p.d0 <= 40 ? 'Ⅱ' : p.d0 <= 80 ? 'Ⅲ' : 'Ⅳ';
          } else if (p.vs >= 150) {
            siteClass = p.d0 <= 3 ? 'Ⅰ₁' : p.d0 <= 15 ? 'Ⅱ' : p.d0 <= 50 ? 'Ⅲ' : 'Ⅳ';
          } else {
            siteClass = p.d0 <= 3 ? 'Ⅰ₁' : p.d0 <= 15 ? 'Ⅲ' : 'Ⅳ';
          }
          return { value: siteClass, unit: `（v_s=${p.vs}m/s, d₀=${p.d0}m）`, isValid: true,
            steps: [
              { desc: '等效剪切波速', latex: `v_s = ${p.vs} \\text{ m/s}` },
              { desc: '覆盖层厚度', latex: `d_0 = ${p.d0} \\text{ m}` },
              { desc: '场地类别', latex: `v_s = ${p.vs} \\text{ m/s}, \\quad d_0 = ${p.d0} \\text{ m} \\rightarrow \\text{场地类别 ${siteClass}}` }
            ]
          };
        }
      },
      {
        id: 'seismic_pile_bearing',
        name: '抗震桩基承载力调整',
        expr: 'R_{aE} = \\zeta_{a} \\cdot R_a',
        note: 'GB 50011-2010 第 4.4.3 条，ζa=1.25（7度）、1.35（8度）、1.45（9度）',
        params: [
          { key: 'Ra', label: 'R<sub>a</sub>', unit: 'kN', default: 800 },
          { key: 'za', label: 'ζ<sub>a</sub>', unit: '', default: 1.25 }
        ],
        scene: "抗震设防时单桩承载力可提高 ζa 倍",
        pitfalls: ["ζa 按抗震设防烈度查表", "仅适用于抗震验算", "群桩效应系数不参与调整"],
        example: { Ra: 800, za: 1.25 },
        calc: (p) => {
          const r = p.za * p.Ra;
          return { value: r.toFixed(2), unit: 'kN', isValid: r > p.Ra,
            steps: [
              { desc: '单桩承载力', latex: `R_a = ${p.Ra} \\text{ kN}` },
              { desc: '抗震调整系数', latex: `\\zeta_a = ${p.za}` },
              { desc: '抗震单桩承载力', latex: `R_{aE} = ${p.za} \\times ${p.Ra} = ${r.toFixed(2)} \\text{ kN}` }
            ]
          };
        }
      }
    ]
  },

  // ===================== 第十章 检测与监测 =====================
  {
    id: 'monitor', name: '第十章 检测监测',
    formulas: [
      {
        id: 'monitor_static_load',
        name: '静载荷试验承载力',
        expr: 'f_{ak} = \\frac{Q_{cr}}{3 \\cdot A}',
        note: 'GB 50007-2010 附录 C，Qcr=临界荷载, A=承压板面积',
        params: [
          { key: 'Qcr', label: 'Q<sub>cr</sub>', unit: 'kN', default: 300 },
          { key: 'A', label: 'A', unit: 'm²', default: 0.25 }
        ],
        scene: "平板载荷试验确定地基承载力特征值",
        pitfalls: ["Qcr 是比例界限荷载（p-s 曲线直线段终点）", "除 3 是安全系数，不能忘", "A 是承压板面积（方形板 0.25m² 或 0.5m²）"],
        example: { Qcr: 300, A: 0.25 },
        calc: (p) => {
          const r = p.Qcr / (3 * p.A);
          return { value: r.toFixed(2), unit: 'kPa', isValid: r > 0,
            steps: [
              { desc: '临界荷载', latex: `Q_{cr} = ${p.Qcr} \\text{ kN}` },
              { desc: '承压板面积', latex: `A = ${p.A} \\text{ m}^2` },
              { desc: '承载力特征值', latex: `f_{ak} = \\frac{${p.Qcr}}{3 \\times ${p.A}} = ${r.toFixed(2)} \\text{ kPa}` }
            ]
          };
        }
      },
      {
        id: 'monitor_pile_wave',
        name: '低应变法波速检测',
        expr: 'L = \\frac{c \\cdot t}{2}',
        note: 'JGJ 106-2014 低应变反射波法，c=波速, t=缺陷反射时间',
        params: [
          { key: 'c', label: 'c', unit: 'm/s', default: 3800 },
          { key: 't', label: 't', unit: 'ms', default: 10.5 }
        ],
        scene: "低应变反射波法检测桩长或桩身缺陷",
        pitfalls: ["t 单位是 ms，需除以 1000 转为 s", "c 是桩身波速（混凝土桩约 3500~4500m/s）", "除以 2 是因为波往返一次"],
        example: { c: 3800, t: 10.5 },
        calc: (p) => {
          const r = p.c * p.t / 1000 / 2;
          return { value: r.toFixed(2), unit: 'm（桩长或缺陷深度）', isValid: r > 0,
            steps: [
              { desc: '波速', latex: `c = ${p.c} \\text{ m/s}` },
              { desc: '反射时间', latex: `t = ${p.t} \\text{ ms} = ${p.t/1000} \\text{ s}` },
              { desc: '桩长/缺陷深度', latex: `L = \\frac{c \\cdot t}{2} = \\frac{${p.c} \\times ${p.t/1000}}{2} = ${r.toFixed(2)} \\text{ m}` }
            ]
          };
        }
      },
      {
        id: 'monitor_compaction',
        name: '压实系数检验',
        expr: '\\lambda_c = \\frac{\\rho_{d}}{\\rho_{d,max}}',
        note: 'GB 50007-2011 附录 H，压实填土地基质量检验',
        params: [
          { key: 'rho_d', label: 'ρ<sub>d</sub>', unit: 'g/cm³', default: 1.58 },
          { key: 'rho_dmax', label: 'ρ<sub>d,max</sub>', unit: 'g/cm³', default: 1.70 }
        ],
        scene: "压实填土地基质量检验",
        pitfalls: ["λc≥0.95（0~800mm）或≥0.97（800mm 以下）", "ρd,max 由 Proctor 击实试验测定", "不同压实度要求对应不同深度范围"],
        example: { rho_d: 1.58, rho_dmax: 1.70 },
        calc: (p) => {
          const r = p.rho_d / p.rho_dmax;
          return { value: r.toFixed(3), unit: '', isValid: r >= 0.95,
            steps: [
              { desc: '实测干密度', latex: `\\rho_d = ${p.rho_d} \\text{ g/cm}^3` },
              { desc: '最大干密度', latex: `\\rho_{d,max} = ${p.rho_dmax} \\text{ g/cm}^3` },
              { desc: '压实系数', latex: `\\lambda_c = \\frac{${p.rho_d}}{${p.rho_dmax}} = ${r.toFixed(3)}${r >= 0.95 ? ' \\geq 0.95 \\quad \\text{合格}' : ' < 0.95 \\quad \\text{不合格}'}` }
            ]
          };
        }
      },
      {
        id: 'monitor_dynamic_pen',
        name: '动力触探判定',
        expr: 'N_{63.5} \\text{ 判定土类与密实度}',
        note: 'GB/T 50123-2019，63.5kg 重锤动力触探（简化：输入锤击数查表）',
        params: [
          { key: 'N635', label: 'N<sub>63.5</sub>', unit: '击/10cm', default: 18 },
          { key: 'N_limit', label: 'N<sub>限值</sub>', unit: '击/10cm', default: 15 }
        ],
        scene: "动力触探试验判定土的密实度",
        pitfalls: ["N63.5 是 63.5kg 重锤、76cm 落距的锤击数", "需做杆长修正（钻杆过长需修正）", "不同土类判定标准不同（砂土/粉土/黏性土）"],
        example: { N635: 18, N_limit: 15 },
        calc: (p) => {
          const pass = p.N635 >= p.N_limit;
          return { value: p.N635.toFixed(0), unit: '击/10cm', isValid: pass,
            steps: [
              { desc: '实测动力触探锤击数', latex: `N_{63.5} = ${p.N635} \\text{ 击/10cm}` },
              { desc: '判定标准', latex: `N_{限值} = ${p.N_limit} \\text{ 击/10cm}` },
              { desc: '结论', latex: `N_{63.5} = ${p.N635} ${pass ? '\\geq' : '<'} ${p.N_limit}${pass ? '\\quad \\text{满足要求}' : '\\quad \\text{不满足要求}'}` }
            ]
          };
        }
      },
      {
        id: 'monitor_cpt_bearing',
        name: '静力触探确定侧阻端阻',
        expr: 'q_{sik} = \\beta_s \\cdot q_c,\\quad q_{pk} = \\alpha_p \\cdot q_{ck}',
        note: 'JGJ 79-2012 第 10.3 节，βs、αp 为地区经验系数',
        params: [
          { key: 'beta_s', label: 'β<sub>s</sub>', unit: '', default: 2.0 },
          { key: 'qc', label: 'q<sub>c</sub>', unit: 'MPa', default: 4.0 },
          { key: 'alpha_p', label: 'α<sub>p</sub>', unit: '', default: 1.5 },
          { key: 'qck', label: 'q<sub>ck</sub>', unit: 'MPa', default: 8.0 }
        ],
        scene: "用静力触探（CPT）数据确定桩侧阻力和端阻力",
        pitfalls: ["βs、αp 是地区经验系数，必须用当地取值", "qc 单位 MPa 需×1000 转为 kPa", "qck 取桩端 4d 范围内锥尖阻力平均值"],
        example: { beta_s: 2.0, qc: 4.0, alpha_p: 1.5, qck: 8.0 },
        calc: (p) => {
          const qsk = p.beta_s * p.qc * 1000;
          const qpk = p.alpha_p * p.qck * 1000;
          return { value: `${qsk.toFixed(0)} / ${qpk.toFixed(0)}`, unit: 'kPa（侧阻 / 端阻）', isValid: qsk > 0 && qpk > 0,
            steps: [
              { desc: '锥尖阻力', latex: `q_c = ${p.qc} \\text{ MPa}` },
              { desc: '桩侧摩阻力标准值', latex: `q_{sik} = \\beta_s \\cdot q_c = ${p.beta_s} \\times ${p.qc} \\times 1000 = ${qsk.toFixed(0)} \\text{ kPa}` },
              { desc: '桩端阻力标准值', latex: `q_{pk} = \\alpha_p \\cdot q_{ck} = ${p.alpha_p} \\times ${p.qck} \\times 1000 = ${qpk.toFixed(0)} \\text{ kPa}` }
            ]
          };
        }
      },
      {
        id: 'monitor_cross_plate',
        name: '十字板剪切试验不排水强度',
        expr: 'c_u = \\frac{M}{K \\cdot \\pi \\cdot d^2 \\cdot (d/2 + h)}',
        note: 'GB/T 50123-2019，K=仪器系数（通常 1.0）',
        params: [
          { key: 'M', label: 'M（扭转力矩）', unit: 'N·m', default: 15 },
          { key: 'K', label: 'K', unit: '', default: 1.0 },
          { key: 'd', label: 'd（板直径）', unit: 'm', default: 0.06 },
          { key: 'h', label: 'h（板高度）', unit: 'm', default: 0.12 }
        ],
        scene: "十字板剪切试验求软黏土不排水抗剪强度 cu",
        pitfalls: ["d、h 单位是 m，不是 mm", "仅适用于饱和软黏土", "cu 值一般 10~50kPa"],
        example: { M: 15, K: 1.0, d: 0.06, h: 0.12 },
        calc: (p) => {
          const den = p.K * Math.PI * p.d * p.d * (p.d / 2 + p.h);
          const r = p.M / den * 1000;
          return { value: r.toFixed(2), unit: 'kPa（不排水强度cu）', isValid: r > 0 && r < 100,
            steps: [
              { desc: '扭转力矩', latex: `M = ${p.M} \\text{ N}\\cdot\\text{m}` },
              { desc: '几何参数', latex: `d = ${p.d} \\text{ m}, \\quad h = ${p.h} \\text{ m}` },
              { desc: '不排水强度', latex: `c_u = \\frac{${p.M}}{${p.K} \\times \\pi \\times ${p.d}^2 \\times (${p.d/2} + ${p.h})} = ${r.toFixed(2)} \\text{ kPa}` }
            ]
          };
        }
      },
      {
        id: 'monitor_pile_static',
        name: '单桩静载试验承载力',
        expr: 'R_a = \\frac{Q_{uk}}{2} = \\frac{Q_{cr}}{2}',
        note: 'JGJ 106-2014 第 4.2 节，取极限承载力的一半或临界荷载的一半',
        params: [
          { key: 'Quk', label: 'Q<sub>uk</sub>（极限荷载）', unit: 'kN', default: 2000 },
          { key: 'K', label: 'K（安全系数）', unit: '', default: 2.0 }
        ],
        scene: "单桩竖向静载试验确定承载力特征值",
        pitfalls: ["Ra=Quk/2，安全系数 K=2", "Quk 由 Q-s 曲线拐点确定", "预制桩和灌注桩判定标准不同"],
        example: { Quk: 2000, K: 2.0 },
        calc: (p) => {
          const r = p.Quk / p.K;
          return { value: r.toFixed(2), unit: 'kN', isValid: r > 0,
            steps: [
              { desc: '极限承载力', latex: `Q_{uk} = ${p.Quk} \\text{ kN}` },
              { desc: '单桩承载力特征值', latex: `R_a = \\frac{Q_{uk}}{K} = \\frac{${p.Quk}}{${p.K}} = ${r.toFixed(2)} \\text{ kN}` }
            ]
          };
        }
      }
    ]
  }
];
