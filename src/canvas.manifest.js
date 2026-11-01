export const manifest = {
  screens: {
    scr_nkohuu: { name: "Overview", route: "/", position: { "x": 160, "y": 220 } },
    scr_kzdolp: { name: "Process Intelligence · Procure-to-Pay", route: "/process", state: { "proc": "p2p" }, position: { "x": 160, "y": 2200 } },
    scr_vhnn2j: { name: "Process Intelligence · Maintenance WO", route: "/process", state: { "proc": "maint" }, position: { "x": 1560, "y": 2200 } },
    scr_6dgos5: { name: "Data mapping · Detailed data", route: "/process-mapping", state: { "tab": "detailed" }, position: { "x": 2960, "y": 2200 } },
    scr_8hypif: { name: "Process mapping · Strategy", route: "/process-mapping-graph", state: { "tab": "strategy" }, position: { "x": 4360, "y": 2200 } },
    scr_rdejzg: { name: "AI Assistant", route: "/assistant", position: { "x": 160, "y": 6160 } },
    scr_idosxg: { name: "Planning · Timeline", route: "/planning", state: { "view": "timeline" }, position: { "x": 160, "y": 8140 } },
    scr_ts1fb1: { name: "Planning · Card", route: "/planning", state: { "view": "list" }, position: { "x": 1560, "y": 8140 } },
    scr_1rl11f: { name: "Governance & Lineage", route: "/governance", position: { "x": 160, "y": 12100 } },
    scr_z8nygr: { name: "Executive Report", route: "/reports", position: { "x": 160, "y": 10120 } },
    scr_a61ukq: { name: "Audit Trail", route: "/audit", position: { "x": 1560, "y": 12100 } },
    scr_0av0pu: { name: "Data Transparency & Control", route: "/trust", position: { "x": 2960, "y": 12100 } },
    scr_0snmtk: { name: "Organization Catalog", route: "/catalog", position: { "x": 4360, "y": 12100 } },
    scr_uvt246: { name: "QAN · Data · Quality control", route: "/qan/data", state: { "tab": "quality" }, position: { "x": 1560, "y": 14080 } },
    scr_d5sigg: { name: "QAN · Data · Assurance", route: "/qan/data", state: { "tab": "assurance" }, position: { "x": 2960, "y": 14080 } },
    scr_6aay70: { name: "QAN · Process · Quality control", route: "/qan/process", state: { "tab": "quality" }, position: { "x": 1560, "y": 16060 } },
    scr_2y34t5: { name: "QAN · Process · Assurance", route: "/qan/process", state: { "tab": "assurance" }, position: { "x": 2960, "y": 16060 } },
    scr_3d09k0: { name: "Best practice · Process", route: "/best-practice/process", state: { "compare": false }, position: { "x": 160, "y": 18040 } },
    scr_6yrg8o: { name: "Best practice · Process compare", route: "/best-practice/process", state: { "compare": true }, position: { "x": 1560, "y": 18040 } },
    scr_wde6ps: { name: "Best practice · Data", route: "/best-practice/data", state: { "compare": false }, position: { "x": 160, "y": 20020 } },
    scr_b95n5g: { name: "Best practice · Data compare", route: "/best-practice/data", state: { "compare": true }, position: { "x": 1560, "y": 20020 } },
    scr_ombhqq: { name: "Data mapping · Outcomes", route: "/process-mapping", state: { "tab": "outcomes" }, position: { "x": 160, "y": 4180 } },
    scr_0j92li: { name: "Data mapping · Data governance", route: "/process-mapping", state: { "tab": "governance" }, position: { "x": 1560, "y": 4180 } },
    scr_zzyx31: { name: "Process mapping · Strategy execution", route: "/process-mapping-graph", state: { "tab": "execution" }, position: { "x": 2960, "y": 4180 } },
    scr_8b7i3u: { name: "Process mapping · Detailed processes", route: "/process-mapping-graph", state: { "tab": "processes" }, position: { "x": 4360, "y": 4180 } },
    scr_chrpjl: { name: "Process mapping · Outcomes", route: "/process-mapping-graph", state: { "tab": "outcomes" }, position: { "x": 5760, "y": 4180 } }
  },
  sections: {
    sec_wwgols: { name: "Entry Point", x: 0, y: 0, width: 1520, height: 1180 },
    sec_1b0m2p: { name: "Process Intelligence", x: 0, y: 1980, width: 5720, height: 1180 },
    sec_0krej5: { name: "Workflow & Visualization", x: 0, y: 3960, width: 7120, height: 1180 },
    sec_1bl489: { name: "AI Assistant", x: 0, y: 5940, width: 1520, height: 1180 },
    sec_uc3vrg: { name: "Planning", x: 0, y: 7920, width: 2920, height: 1180 },
    sec_f6gu21: { name: "Reporting", x: 0, y: 9900, width: 1520, height: 1180 },
    sec_2odb8b: { name: "Governance & Compliance", x: 0, y: 11880, width: 5720, height: 1180 },
    sec_ncq9yl: { name: "Diligence · Data", x: 0, y: 13860, width: 4320, height: 1180 },
    sec_npvljh: { name: "Diligence · Process", x: 0, y: 15840, width: 4320, height: 1180 },
    sec_l6x652: { name: "Best practice · Process", x: 0, y: 17820, width: 2920, height: 1180 },
    sec_iqoexb: { name: "Best practice · Data", x: 0, y: 19800, width: 2920, height: 1180 }
  },
  layers: [
  { kind: "section", id: "sec_wwgols", children: [
    { kind: "screen", id: "scr_nkohuu" }]
  },
  { kind: "section", id: "sec_1b0m2p", children: [
    { kind: "screen", id: "scr_kzdolp" },
    { kind: "screen", id: "scr_vhnn2j" },
    { kind: "screen", id: "scr_6dgos5" },
    { kind: "screen", id: "scr_8hypif" }]
  },
  { kind: "section", id: "sec_0krej5", children: [
    { kind: "screen", id: "scr_ombhqq" },
    { kind: "screen", id: "scr_0j92li" },
    { kind: "screen", id: "scr_zzyx31" },
    { kind: "screen", id: "scr_8b7i3u" },
    { kind: "screen", id: "scr_chrpjl" }]
  },
  { kind: "section", id: "sec_1bl489", children: [
    { kind: "screen", id: "scr_rdejzg" }]
  },
  { kind: "section", id: "sec_uc3vrg", children: [
    { kind: "screen", id: "scr_idosxg" },
    { kind: "screen", id: "scr_ts1fb1" }]
  },
  { kind: "section", id: "sec_f6gu21", children: [
    { kind: "screen", id: "scr_z8nygr" }]
  },
  { kind: "section", id: "sec_2odb8b", children: [
    { kind: "screen", id: "scr_1rl11f" },
    { kind: "screen", id: "scr_a61ukq" },
    { kind: "screen", id: "scr_0av0pu" },
    { kind: "screen", id: "scr_0snmtk" }]
  },
  { kind: "section", id: "sec_ncq9yl", children: [
    { kind: "screen", id: "scr_uvt246" },
    { kind: "screen", id: "scr_d5sigg" }]
  },
  { kind: "section", id: "sec_npvljh", children: [
    { kind: "screen", id: "scr_6aay70" },
    { kind: "screen", id: "scr_2y34t5" }]
  },
  { kind: "section", id: "sec_l6x652", children: [
    { kind: "screen", id: "scr_3d09k0" },
    { kind: "screen", id: "scr_6yrg8o" }]
  },
  { kind: "section", id: "sec_iqoexb", children: [
    { kind: "screen", id: "scr_wde6ps" },
    { kind: "screen", id: "scr_b95n5g" }]
  }]

};