# Requirement List

> Iteration status: started
> Previous iteration note: `2606_3` is treated as invalidated context only. Its implementation conclusions are not approval evidence for this iteration.

## Goal

Rebuild the requirement management experience page by page with a Linear-inspired interaction model. Each page must be reviewed and confirmed before the next page or real frontend implementation starts.

## Page Sequence

| Order | Page | Deliverable | Status | Confirmation Rule |
|---|---|---|---|---|
| 1 | 原始需求池 | Spec + reviewable HTML prototype | In review | Must be confirmed before any other page starts |
| 2 | 原始需求 Peek | Integrated with raw pool prototype | Pending | Starts only after raw pool list direction is accepted |
| 3 | 拆分工作区 | Spec + prototype | Pending | Starts after raw pool and Peek are accepted |
| 4 | 产品需求池 | Spec + reviewable HTML prototype | Ready for first review | Follows the confirmed raw pool style and interaction logic |
| 5 | 我的工作 | Spec + prototype | Pending | Starts after core object pages are accepted |
| 6 | 看板 / 迭代 | Spec + prototype | Pending | Starts last as alternate views and planning surfaces |

## Current Page

- Page: 原始需求池 + 产品需求池
- Prototype: `Prototypes/requirement-pools.html`
- Spec: `Requirement_Pools_PRD.md`
- Review log: `Page_Review_Log.md`
- Implementation baseline: Confirmed on 2026-07-14 — `2605 保能力、2606_4 定交互`
- Delivery controls: `Delivery_Remediation_Plan.md`, `Implementation_Traceability_Matrix.md`

## Constraints

- Do not modify the production Vue frontend until the current page prototype is confirmed.
- Keep Linear as the structural and interaction reference, not as a full brand copy.
- Preserve Chinese business terms and the current raw requirement field model.
- Reuse the confirmed raw requirement pool visual density, keyboard Peek model, field menu model, and detail-page expansion pattern for product requirement pages.
- Do not introduce backend API changes in the prototype stage.
