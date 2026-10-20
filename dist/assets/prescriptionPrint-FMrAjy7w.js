import{j as i,r as R}from"./vendor-react-Cg95Wd9j.js";import{B as j,O as I,l as O,j as E,R as C,V as H,W as U}from"./index-CfItjhrY.js";import{I as w}from"./input-qLGQSVB6.js";import{L as f}from"./label-SblnkU2y.js";import{T as A}from"./textarea-DJGQrIav.js";import{C as G}from"./checkbox-CUKavNMH.js";import{C as q}from"./combobox-freetext-Ct4H1Zm3.js";import{u as k,i as M}from"./vendor-i18n-02tLOPTM.js";import{a2 as W,aj as V,ar as z,aq as P}from"./vendor-icons-B9J2mvrK.js";import{w as K,b as J}from"./printWatermark-BmQ03DH8.js";import{p as Q,d as X}from"./htmlToPdf-D95Y8rE9.js";const Y=new Set(["medication","medicament","supplement","supplementaire","antiparasitaire","vaccine","vaccin"]);function B(t){return t?Y.has(t.trim().toLowerCase()):!1}function S(t,p){const u=p.trim().toLowerCase();if(u)return t.find(a=>a.name.trim().toLowerCase()===u)}const Z=()=>({medication_name:"",dosage:"",frequency:"",duration:"",instructions:"",quantity:1,route:"oral",sold_by_clinic:!0,unit_price:void 0});function L(t){if(!t)return 0;const p=t;return Number(p.selling_price??p.unit_cost??0)||0}function de({medications:t,onChange:p,stockItems:u,editMode:a=!1}){const{t:n}=k("medical"),{t:s}=k("common"),x=["oral",n("prescriptionMeds.routesList.injectable"),n("prescriptionMeds.routesList.topical"),n("prescriptionMeds.routes.iv"),n("prescriptionMeds.routes.im"),n("prescriptionMeds.routes.sc")],c=[n("prescriptionMeds.freq.onceDaily"),n("prescriptionMeds.freq.twiceDaily"),n("prescriptionMeds.freqList.threeDaily"),n("prescriptionMeds.freqList.onceWeekly"),n("prescriptionMeds.freq.asNeeded")],g=u.filter(r=>B(r.category)&&r.active),m=(r,o)=>{p(t.map((e,y)=>y!==r?e:typeof o=="function"?o(e):{...e,...o}))},_=()=>p([...t,Z()]),$=r=>{t.length<=1||p(t.filter((o,e)=>e!==r))};return i.jsxs("div",{className:"space-y-4",children:[i.jsxs("div",{className:"flex items-center justify-between gap-2",children:[i.jsx("p",{className:"text-sm text-muted-foreground",children:n("prescriptionMeds.productsAvailable",{count:g.length})}),i.jsxs(j,{type:"button",onClick:_,size:"sm",variant:"outline",children:[i.jsx(W,{className:"h-4 w-4 mr-2"}),s("add")]})]}),t.map((r,o)=>{const e=S(g,r.medication_name),y=e?Number(e.current_quantity||0):0,N=!!(e&&y>0),d=!!(e&&r.sold_by_clinic),v=L(e),b=r.unit_price!=null&&Number.isFinite(r.unit_price)?r.unit_price:v,F=b*(Number(r.quantity)||1),D=N||r.sold_by_clinic;return i.jsxs("div",{className:"rounded-lg border border-border bg-muted/40 p-4 space-y-3",children:[i.jsxs("div",{className:"flex items-center justify-between",children:[i.jsx("h4",{className:"text-sm font-medium",children:n("prescriptionMeds.medicationN",{n:o+1})}),t.length>1&&i.jsx(j,{type:"button",variant:"ghost",size:"sm",onClick:()=>$(o),className:"h-8 w-8 p-0 text-destructive",children:i.jsx(V,{className:"h-4 w-4"})})]}),i.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3",children:[i.jsxs("div",{className:"md:col-span-2 lg:col-span-1",children:[i.jsx(f,{children:n("prescriptionMeds.medicationRequired")}),i.jsx(q,{value:r.medication_name,onChange:l=>{const h=S(g,l);m(o,{medication_name:l,unit_price:h?L(h):void 0})},options:g.map(l=>l.name),category:"medication_name",placeholder:n("prescriptionMeds.cataloguePlaceholder")}),e?i.jsxs("p",{className:"text-xs text-muted-foreground mt-1",children:[e.description?`${e.description} — `:"",n("prescriptionMeds.stockInfo",{qty:y,unit:e.unit}),y<=0?n("prescriptionMeds.outOfStockShort"):"",v>0?n("prescriptionMeds.catalogPrice",{price:v.toFixed(2)}):""]}):r.medication_name.trim()?i.jsx("p",{className:"text-xs text-muted-foreground mt-1",children:n("prescriptionMeds.offCatalog")}):null]}),i.jsxs("div",{children:[i.jsx(f,{children:n("prescriptionMeds.dosageLabel")}),i.jsx(w,{value:r.dosage||"",onChange:l=>m(o,{dosage:l.target.value}),placeholder:n("prescriptionMeds.dosagePlaceholder")})]}),i.jsxs("div",{children:[i.jsx(f,{children:n("prescriptionMeds.frequencyLabel")}),i.jsx(q,{value:r.frequency||"",onChange:l=>m(o,{frequency:l}),options:c,category:"frequency",placeholder:n("prescriptionMeds.frequencyPlaceholder")})]}),i.jsxs("div",{children:[i.jsx(f,{children:n("prescriptionMeds.durationLabel")}),i.jsx(w,{value:r.duration||"",onChange:l=>m(o,{duration:l.target.value}),placeholder:n("prescriptionMeds.durationPlaceholder")})]}),i.jsxs("div",{children:[i.jsx(f,{children:n("prescriptionMeds.quantityLabel")}),i.jsx(w,{type:"number",min:1,value:r.quantity,onChange:l=>m(o,{quantity:parseInt(l.target.value,10)||1})})]}),i.jsxs("div",{children:[i.jsx(f,{children:n("prescriptionMeds.routeLabel")}),i.jsx(q,{value:r.route||"oral",onChange:l=>m(o,{route:l}),options:x,category:"administration_route",placeholder:n("prescriptionMeds.routePlaceholder")})]})]}),i.jsxs("div",{children:[i.jsx(f,{children:n("prescriptionMeds.instructionsLabel")}),i.jsx(A,{value:r.instructions||"",onChange:l=>m(o,{instructions:l.target.value}),placeholder:n("prescriptionMeds.instructionsPlaceholder"),className:"h-16"})]}),e&&i.jsxs("div",{className:"space-y-3 rounded-md border border-emerald-200 bg-emerald-50/80 p-3 dark:border-emerald-900 dark:bg-emerald-950/40",children:[i.jsxs("div",{className:"flex items-start gap-2",children:[i.jsx(G,{id:`consult-sold-${o}`,checked:r.sold_by_clinic,disabled:!D,onCheckedChange:l=>{const h=l===!0;m(o,{sold_by_clinic:h,unit_price:h?r.unit_price??v:r.unit_price})}}),i.jsxs("div",{className:"space-y-0.5",children:[i.jsx(f,{htmlFor:`consult-sold-${o}`,className:"text-sm font-medium cursor-pointer",children:n("prescriptionMeds.soldByClinic")}),i.jsx("p",{className:"text-xs text-muted-foreground",children:a?r.sold_by_clinic?n("prescriptionMeds.saleRecordedEdit"):n(N?"prescriptionMeds.saleEditHint":"prescriptionMeds.outOfStockRxOnly"):n(N?"prescriptionMeds.deductOnSave":"prescriptionMeds.outOfStockRxOnlyCreate")})]})]}),d&&i.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-3 pl-6",children:[i.jsxs("div",{children:[i.jsx(f,{htmlFor:`unit-price-${o}`,children:n("prescriptionMeds.unitPriceMad")}),i.jsx(w,{id:`unit-price-${o}`,type:"number",min:0,step:"0.01",value:b,onChange:l=>{const h=l.target.value;m(o,{unit_price:h===""?0:Math.max(0,Number(h)||0)})}}),i.jsx("p",{className:"text-xs text-muted-foreground mt-1",children:n("prescriptionMeds.catalogPriceHint",{price:v.toFixed(2)})})]}),i.jsxs("div",{className:"flex flex-col justify-end",children:[i.jsx("p",{className:"text-sm font-medium",children:n("prescriptionMeds.lineTotal",{total:F.toFixed(2)})}),i.jsx("p",{className:"text-xs text-muted-foreground",children:n("prescriptionMeds.lineCalc",{qty:Number(r.quantity)||1,price:b.toFixed(2)})})]})]})]})]},o)})]})}function ue(t,p){const u=p.filter(a=>B(a.category)&&a.active);return t.filter(a=>a.medication_name.trim()!=="").map(a=>{const n=S(u,a.medication_name),s=Number((n==null?void 0:n.current_quantity)||0),x=!!(n&&a.sold_by_clinic);if(x&&s<Number(a.quantity||1))throw new Error(M.t("medical:prescriptionMeds.insufficientStockFor",{name:a.medication_name.trim(),qty:s}));const c=x&&s>0,g=L(n),m=a.unit_price!=null&&Number.isFinite(a.unit_price)?Number(a.unit_price):g;return{medication_name:a.medication_name.trim(),dosage:a.dosage||void 0,frequency:a.frequency||void 0,duration:a.duration||void 0,quantity:a.quantity||1,instructions:a.instructions||void 0,route:a.route||void 0,stock_item_id:n==null?void 0:n.id,sold_by_clinic:c,unit_price:c?m:void 0}})}function me({prescription:t,compact:p=!1}){const{settings:u}=I(),{isFree:a}=O(),{toast:n}=E(),{t:s,i18n:x}=k("medical"),[c,g]=R.useState(null),m=t.prescribedBy,_=()=>{const e=H,y=U,N=t.medications.map((d,v)=>{const b=[e(d.name),e(d.dosage||""),e(d.frequency||""),d.duration?e(s("print.prescription.forDuration",{duration:d.duration})):"",d.quantity?e(s("print.prescription.qty",{qty:`${d.quantity}${d.unit?` ${d.unit}`:""}`})):"",d.refills&&d.refills>0?e(s("print.prescription.refills",{count:d.refills})):""].filter(Boolean);return`
          <p class="rx-line">
            <span class="rx-num">${v+1}.</span>
            <span class="rx-text"><strong>${b[0]}</strong>${b.length>1?` — ${b.slice(1).join(" — ")}`:""}</span>
          </p>
          ${d.instructions?`<p class="rx-instr">${e(d.instructions)}</p>`:""}`}).join("");return`
      <html>
        <head>
          <title>${e(s("print.prescription.docTitle",{name:t.petName}))}</title>
          <style>
            @page { margin: 16mm; }
            body {
              font-family: "Times New Roman", Times, Georgia, serif;
              margin: 0;
              padding: 16px 28px;
              color: #111;
              font-size: 18px;
              line-height: 1.65;
            }
            .header {
              text-align: center;
              padding-bottom: 16px;
              border-bottom: 2px solid #222;
              margin-bottom: 20px;
            }
            .header h1 {
              font-size: 28px;
              letter-spacing: 0.04em;
              margin: 10px 0 6px;
              font-weight: 700;
            }
            .header h2 {
              font-size: 22px;
              margin: 0 0 8px;
              font-weight: 600;
            }
            .header p {
              margin: 2px 0;
              font-size: 16px;
              color: #333;
            }
            .meta {
              margin: 16px 0 20px;
              font-size: 18px;
            }
            .meta p { margin: 4px 0; }
            .section-title {
              font-size: 17px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.03em;
              margin: 20px 0 10px;
              padding-bottom: 3px;
              border-bottom: 1px solid #ccc;
            }
            .patient p {
              margin: 5px 0;
              font-size: 18px;
            }
            .rp-mark {
              font-family: Georgia, "Times New Roman", serif;
              font-size: 36px;
              font-weight: 700;
              font-style: italic;
              margin: 22px 0 14px;
            }
            .medications {
              margin: 0 0 12px 4px;
            }
            .rx-line {
              margin: 0 0 14px;
              font-size: 20px;
              line-height: 1.5;
            }
            .rx-num {
              display: inline-block;
              min-width: 1.6em;
              font-weight: 700;
            }
            .rx-text { }
            .rx-instr {
              margin: -8px 0 14px 1.6em;
              font-size: 16px;
              font-style: italic;
              color: #333;
            }
            .notes {
              margin-top: 18px;
              font-size: 17px;
            }
            .notes p { margin: 5px 0; }
            .footer {
              margin-top: 56px;
              text-align: right;
            }
            .signature-block {
              display: inline-block;
              text-align: center;
              min-width: 240px;
              font-size: 17px;
            }
            .signature-line {
              border-top: 1.5px solid #222;
              margin: 48px 0 8px;
            }
            .footer small {
              display: block;
              text-align: center;
              margin-top: 32px;
              font-size: 13px;
              color: #555;
            }
            ${K}
          </style>
        </head>
        <body>
          ${J(a)}
          <div class="header">
            ${u.logo?`<img src="${y(u.logo)}" alt="${e(s("print.prescription.clinicLogoAlt"))}" style="height:64px;margin-bottom:8px;"/>`:""}
            <h1>${e(s("print.prescription.heading"))}</h1>
            <h2>${e(u.clinicName||"")}</h2>
            <p>${e(u.address||"")}</p>
            <p>${e(s("print.prescription.tel"))} ${e(u.phone||"")} | ${e(s("print.prescription.email"))} ${e(u.email||"")}</p>
          </div>

          <div class="meta">
            <p><strong>${e(s("print.prescription.date"))}</strong> ${e(new Date(t.date).toLocaleDateString(C(x.language)))}</p>
            <p><strong>${e(s("print.prescription.prescribedBy"))}</strong> ${e(m||"—")}</p>
          </div>

          <div class="patient">
            <p class="section-title">${e(s("print.prescription.patient"))}</p>
            <p><strong>${e(s("print.prescription.owner"))}</strong> ${e(t.clientName)}</p>
            <p><strong>${e(s("print.prescription.animal"))}</strong> ${e(t.petName)}</p>
            ${t.diagnosis?`<p><strong>${e(s("print.prescription.diagnosis"))}</strong> ${e(t.diagnosis)}</p>`:""}
            ${t.duration?`<p><strong>${e(s("print.prescription.validity"))}</strong> ${e(t.duration)}</p>`:""}
          </div>

          <p class="rp-mark">Rp/</p>
          <div class="medications">
            ${N||`<p>${e(s("print.prescription.noMeds"))}</p>`}
          </div>

          ${t.instructions?`<div class="notes"><p class="section-title">${e(s("print.prescription.generalInstructions"))}</p><p>${e(t.instructions)}</p></div>`:""}
          ${t.followUpDate?`<div class="notes"><p><strong>${e(s("print.prescription.followUpScheduled"))}</strong> ${e(new Date(t.followUpDate).toLocaleDateString(C(x.language)))}</p></div>`:""}
          ${t.notes&&t.notes!==t.instructions?`<div class="notes"><p class="section-title">${e(s("print.prescription.notes"))}</p><p>${e(t.notes)}</p></div>`:""}

          <div class="footer">
            <div class="signature-block">
              <div class="signature-line"></div>
              <p>${e(s("print.prescription.vetSignature"))}</p>
            </div>
            <small>${e(s("print.prescription.validityNote"))}</small>
          </div>
        </body>
      </html>
    `},$=()=>!(t!=null&&t.petName)||!(t!=null&&t.clientName)?(n({title:s("print.prescription.incompleteTitle"),description:s("print.prescription.incompleteBody"),variant:"destructive"}),!1):!0,r=async()=>{if($()){g("print");try{await Q(_())}catch(e){n({title:s("print.prescription.printFailedTitle"),description:(e==null?void 0:e.message)||s("print.prescription.printFailedBody"),variant:"destructive"})}finally{g(null)}}},o=async()=>{if($()){g("download");try{const e=`prescription-${t.petName}-${new Date(t.date).toISOString().slice(0,10)}.pdf`;await X(_(),e),n({title:s("print.prescription.downloadTitle"),description:s("print.prescription.downloadBody")})}catch(e){n({title:s("print.prescription.downloadFailedTitle"),description:(e==null?void 0:e.message)||s("print.prescription.printFailedBody"),variant:"destructive"})}finally{g(null)}}};return p?i.jsxs("div",{className:"flex gap-1",children:[i.jsx(j,{size:"sm",variant:"outline",onClick:r,disabled:!!c,className:"h-8 w-8 p-0",title:s("print.prescription.printRx"),children:i.jsx(z,{className:"h-3.5 w-3.5"})}),i.jsx(j,{size:"sm",variant:"outline",onClick:o,disabled:!!c,className:"h-8 w-8 p-0",title:s("print.prescription.downloadRx"),children:i.jsx(P,{className:"h-3.5 w-3.5"})})]}):i.jsxs("div",{className:"flex flex-wrap gap-2",children:[i.jsxs(j,{size:"sm",variant:"outline",onClick:r,disabled:!!c,className:"gap-2",children:[i.jsx(z,{className:"h-4 w-4"}),s(c==="print"?"print.prescription.opening":"print.prescription.print")]}),i.jsxs(j,{size:"sm",variant:"outline",onClick:o,disabled:!!c,className:"gap-2",children:[i.jsx(P,{className:"h-4 w-4"}),s(c==="download"?"print.prescription.opening":"print.prescription.downloadPdf")]})]})}const T=(t,p)=>M.t(t,{ns:"medical",...p});function ge(t){var a,n,s,x;const p=`${((a=t.client)==null?void 0:a.first_name)||""} ${((n=t.client)==null?void 0:n.last_name)||""}`.trim(),u=((s=t.animal)==null?void 0:s.name)||"";return{id:t.id,consultationId:t.consultation_id,clientId:t.client_id,clientName:p||"—",petId:t.animal_id,petName:u||"—",date:t.prescription_date,prescribedBy:M.t("notSpecified",{ns:"common"}),diagnosis:t.diagnosis||"",medications:((x=t.medications)==null?void 0:x.map(c=>({id:c.id,name:c.medication_name,dosage:c.dosage||"",frequency:c.frequency||"",duration:c.duration||"",instructions:c.instructions||"",quantity:c.quantity||1,unit:T("print.prescription.unit"),cost:0})))||[],instructions:t.notes||"",duration:t.valid_until?T("dossier.validUntilLabel",{date:new Date(t.valid_until).toLocaleDateString(C(M.language))}):"",followUpDate:void 0,status:t.status||"active",notes:t.notes||"",createdAt:t.created_at}}export{me as P,de as a,ue as b,L as c,Z as e,S as f,B as i,ge as t};
