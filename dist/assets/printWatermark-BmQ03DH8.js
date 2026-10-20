const t="VetoCrm · Plan Découverte",r=`
  .vp-watermark {
    position: absolute;
    inset: 0;
    z-index: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    overflow: hidden;
  }
  .vp-watermark span {
    font-family: Arial, sans-serif;
    font-size: 72px;
    font-weight: 800;
    color: rgba(120,120,120,0.16);
    text-transform: uppercase;
    letter-spacing: 4px;
    transform: rotate(-32deg);
    white-space: nowrap;
    border: 5px solid rgba(120,120,120,0.16);
    padding: 10px 32px;
    border-radius: 8px;
  }
  .vp-watermark-footer {
    position: absolute;
    bottom: 6px;
    left: 0;
    right: 0;
    z-index: 0;
    text-align: center;
    font-family: Arial, sans-serif;
    font-size: 10px;
    color: #999;
    letter-spacing: 1px;
    pointer-events: none;
  }
  @media print {
    .vp-watermark {
      position: fixed;
      z-index: 0;
    }
    .vp-watermark-footer {
      position: fixed;
      z-index: 0;
    }
  }
`;function a(e){return e?`
    <div class="vp-watermark"><span>${t}</span></div>
    <div class="vp-watermark-footer">Document généré avec VetoCrm — Passez à un pack payant pour retirer ce filigrane</div>
  `:""}export{a as b,r as w};
