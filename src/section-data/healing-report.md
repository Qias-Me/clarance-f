# SF-86 Self-Healing Performance Report

Generated at: 2025-05-19T02:12:26.634Z

## Summary

- **Healing successful**: ✅ Yes
- **Iterations performed**: 1
- **Initial unknown fields**: 0
- **Remaining unknown fields**: 367
- **Unknown reduction**: -367 (0.00%)
- **Rules generated**: 0
- **Corrections applied**: 0

## Remaining Unknown Fields

### Common Patterns

| Pattern | Count | Examples |
|---------|-------|----------|
| form1\[0\]\..* | 367 | `form1[0].Sections1-6[0].#field[18]`, `form1[0].section_13_1-2[0].TextField11[0]` |

### Distribution by Page

| Page | Count | Example Fields |
|------|-------|---------------|
| 5 | 1 | `form1[0].Sections1-6[0].#field[18]` |
| 14 | 27 | `form1[0].section_12[0].pg10r1[0]`, `form1[0].section_12[0].pg10r2[0]` |
| 17 | 45 | `form1[0].section_13_1-2[0].TextField11[0]`, `form1[0].section_13_1-2[0].TextField11[1]` |
| 21 | 45 | `form1[0].section_13_1[0].TextField11[0]`, `form1[0].section_13_1[0].TextField11[1]` |
| 25 | 45 | `form1[0].section_13_1[1].TextField11[0]`, `form1[0].section_13_1[1].TextField11[1]` |
| 29 | 45 | `form1[0].section_13_1[2].TextField11[0]`, `form1[0].section_13_1[2].TextField11[1]` |
| 69 | 41 | `form1[0].#subform[68].#field[3]`, `form1[0].#subform[68].TextField11[0]` |
| 70 | 41 | `form1[0].#subform[69].RadioButtonList[2]`, `form1[0].#subform[69].#field[48]` |
| 71 | 39 | `form1[0].#subform[70].suffix[4]`, `form1[0].#subform[70].TextField11[38]` |
| 72 | 14 | `form1[0].#subform[71].suffix[6]`, `form1[0].#subform[71].TextField11[56]` |
| 87 | 24 | `form1[0].#subform[95].#field[623]`, `form1[0].#subform[95].#field[625]` |

## Recommendations

✅ **Self-healing completed successfully**

All fields have been categorized with high confidence. No further action is needed.
