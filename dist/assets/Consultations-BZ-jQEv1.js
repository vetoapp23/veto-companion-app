const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/consultationVisitSync-q_gAF8aZ.js","assets/index-CfItjhrY.js","assets/vendor-react-Cg95Wd9j.js","assets/vendor-charts-gQVxDXAv.js","assets/vendor-supabase-DVQeEGqo.js","assets/vendor-i18n-02tLOPTM.js","assets/vendor-radix-SzILTRXJ.js","assets/vendor-icons-B9J2mvrK.js","assets/vendor-query-DQiNoSWI.js","assets/index-VttWhxpk.css","assets/visits-BXG4GI4k.js","assets/accountingLedger-DXLfxz20.js"])))=>i.map(i=>d[i]);
import{j as e,r as c}from"./vendor-react-Cg95Wd9j.js";import{O as ge,l as Te,B as p,V as Le,R as H,U as X,s as y,P as ke,j as Ae,C as F,o as me,p as xe,r as I}from"./index-CfItjhrY.js";import{I as Fe}from"./input-qLGQSVB6.js";import{B as V}from"./badge-Caayft07.js";import{D as Ie,a as Ue,b as ze,c as qe,d as Re}from"./dialog-CrbbowE9.js";import{A as Oe,a as He,b as Ve,c as Be,d as Me,e as We,f as Ge,g as Ye}from"./alert-dialog-DNJlGRJP.js";import{A as Je}from"./AppPageHeader-38EskyZP.js";import{N as Ke}from"./NewConsultationModal-BqGjl34W.js";import{C as Qe}from"./ConsultationEditModalNew-BuIJj_0i.js";import{w as Xe,b as Ze}from"./printWatermark-BmQ03DH8.js";import{u as B}from"./vendor-i18n-02tLOPTM.js";import{ar as es,s as Y,ag as ss,ah as ts,a2 as as,ai as is,J as ns,ay as ls,P as U,r as rs,a6 as J,aj as pe,E as os}from"./vendor-icons-B9J2mvrK.js";import{N as cs}from"./NewPrescriptionModal-lzqEJSw8.js";import{P as ds}from"./PrescriptionEditModal-DcNcN-G_.js";import{P as K,t as Q}from"./prescriptionPrint-FMrAjy7w.js";import{u as ms}from"./use-display-preference-BVx8ut0J.js";import{b as xs,C as ps,D as us,p as hs,E as gs}from"./useDatabase-DjoDdym8.js";import{_ as fs}from"./vendor-supabase-DVQeEGqo.js";import{T as vs,a as js,b as ue,c as _,d as ws,e as D}from"./table-B9J0YKJW.js";import{L as Ns}from"./ListDateFilter-BKU_GdCq.js";import{D as bs,m as $s}from"./accountingLedger-DXLfxz20.js";import{u as Cs}from"./RoleGuard-DJSTCsxY.js";import"./vendor-charts-gQVxDXAv.js";import"./vendor-radix-SzILTRXJ.js";import"./vendor-query-DQiNoSWI.js";import"./label-SblnkU2y.js";import"./textarea-DJGQrIav.js";import"./switch-DEihFsEb.js";import"./NewClientModal-xSsDgcza.js";import"./useAppSettings--ZabGHF6.js";import"./useQuotaCheck-BykTrdqa.js";import"./quotaEnforcement-pio9jawb.js";import"./NewPetModal-C8GDCBi7.js";import"./alert-CPYuGlm_.js";import"./combobox-freetext-Ct4H1Zm3.js";import"./photoCompression-Clg5Zx3y.js";import"./checkbox-CUKavNMH.js";import"./htmlToPdf-D95Y8rE9.js";import"./stockMovements-CjzoeLC9.js";function he({consultation:t}){const{settings:l}=ge(),{isFree:x}=Te(),{t:i,i18n:v}=B("medical"),{t:$}=B("common"),P=()=>{var g,S,u,r,o,z,k,q,E;try{const d=window.open("",`print_consultation_${t.id}`,"height=800,width=800");if(!d){alert(i("print.consultation.popupBlocked"));return}const a=Le,A=((g=t.animal)==null?void 0:g.name)||i("print.consultation.animalFallback"),j="N/A",R=(S=t.animal)!=null&&S.birth_date?i("print.consultation.years",{count:Math.floor((new Date().getTime()-new Date(t.animal.birth_date).getTime())/(365.25*24*60*60*1e3))}):j,M=`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${a(i("print.consultation.docTitle",{name:A}))}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              line-height: 1.6;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #333;
              padding-bottom: 10px;
              margin-bottom: 20px;
            }
            .clinic-info {
              text-align: center;
              color: #666;
              margin-bottom: 30px;
            }
            .consultation-info {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 30px;
            }
            .info-section {
              border: 1px solid #ddd;
              padding: 15px;
              border-radius: 5px;
            }
            .info-title {
              font-weight: bold;
              color: #333;
              margin-bottom: 10px;
              font-size: 14px;
              text-transform: uppercase;
            }
            .info-content {
              color: #666;
            }
            .medical-section {
              margin-bottom: 20px;
            }
            .medical-title {
              font-weight: bold;
              color: #333;
              margin-bottom: 8px;
              border-bottom: 1px solid #eee;
              padding-bottom: 4px;
            }
            .medical-content {
              color: #666;
              margin-bottom: 15px;
            }
            .vitals {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 15px;
              margin-bottom: 20px;
            }
            .vital-item {
              text-align: center;
              padding: 10px;
              border: 1px solid #ddd;
              border-radius: 5px;
            }
            .vital-label {
              font-size: 12px;
              color: #666;
              margin-bottom: 5px;
            }
            .vital-value {
              font-size: 18px;
              font-weight: bold;
              color: #333;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              color: #666;
              font-size: 12px;
              border-top: 1px solid #ddd;
              padding-top: 20px;
            }
            @media print {
              body { 
                margin: 0; 
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .header { page-break-after: avoid; }
              @page { size: auto; margin: 10mm; }
            }
            ${Xe}
          </style>
        </head>
        <body>
          ${Ze(x)}
          <div class="header">
            <h1>${a(l.clinicName||i("print.consultation.clinicFallback"))}</h1>
            <div class="clinic-info">
              <p>${a(l.address||"")}</p>
              <p>${a(i("print.consultation.tel"))} ${a(l.phone||"")} | ${a(i("print.consultation.email"))} ${a(l.email||"")}</p>
            </div>
            <h2>${a(i("print.consultation.reportTitle"))}</h2>
          </div>

          <div class="consultation-info">
            <div class="info-section">
              <div class="info-title">${a(i("print.consultation.clientInfo"))}</div>
              <div class="info-content">
                <strong>${a(i("print.consultation.name"))}</strong> ${a(((u=t.client)==null?void 0:u.first_name)||"")} ${a(((r=t.client)==null?void 0:r.last_name)||"")}<br>
                <strong>${a(i("print.consultation.phone"))}</strong> ${a(((o=t.client)==null?void 0:o.phone)||j)}<br>
                <strong>${a(i("print.consultation.email"))}</strong> ${a(((z=t.client)==null?void 0:z.email)||j)}
              </div>
            </div>
            
            <div class="info-section">
              <div class="info-title">${a(i("print.consultation.animalInfo"))}</div>
              <div class="info-content">
                <strong>${a(i("print.consultation.animalName"))}</strong> ${a(((k=t.animal)==null?void 0:k.name)||j)}<br>
                <strong>${a(i("print.consultation.species"))}</strong> ${a(((q=t.animal)==null?void 0:q.species)||j)}<br>
                <strong>${a(i("print.consultation.breed"))}</strong> ${a(((E=t.animal)==null?void 0:E.breed)||j)}<br>
                <strong>${a(i("print.consultation.age"))}</strong> ${a(R)}
              </div>
            </div>
          </div>

          <div class="info-section" style="margin-bottom: 20px;">
            <div class="info-title">${a(i("print.consultation.detailsTitle"))}</div>
            <div class="info-content">
              <strong>${a(i("print.consultation.date"))}</strong> ${a(new Date(t.consultation_date).toLocaleDateString(H(v.language)))}<br>
              <strong>${a(i("print.consultation.type"))}</strong> ${a(t.consultation_type||i("print.consultation.routine"))}<br>
              <strong>${a(i("print.consultation.status"))}</strong> ${a(t.status||i("print.consultation.completed"))}
            </div>
          </div>

          ${t.weight||t.temperature||t.heart_rate||t.respiratory_rate?`
          <div class="vitals">
            ${t.weight?`
            <div class="vital-item">
              <div class="vital-label">${a(i("print.consultation.weight"))}</div>
              <div class="vital-value">${a(t.weight)} kg</div>
            </div>
            `:""}
            ${t.temperature?`
            <div class="vital-item">
              <div class="vital-label">${a(i("print.consultation.temperature"))}</div>
              <div class="vital-value">${a(X(t.temperature))}</div>
            </div>
            `:""}
            ${t.heart_rate?`
            <div class="vital-item">
              <div class="vital-label">${a(i("print.consultation.heartRate"))}</div>
              <div class="vital-value">${a(t.heart_rate)} bpm</div>
            </div>
            `:""}
            ${t.respiratory_rate?`
            <div class="vital-item">
              <div class="vital-label">${a(i("print.consultation.respiratoryRate"))}</div>
              <div class="vital-value">${a(t.respiratory_rate)}/min</div>
            </div>
            `:""}
          </div>
          `:""}

          ${t.symptoms?`
          <div class="medical-section">
            <div class="medical-title">${a(i("print.consultation.symptoms"))}</div>
            <div class="medical-content">${a(t.symptoms)}</div>
          </div>
          `:""}

          ${t.diagnosis?`
          <div class="medical-section">
            <div class="medical-title">${a(i("print.consultation.diagnosis"))}</div>
            <div class="medical-content">${a(t.diagnosis)}</div>
          </div>
          `:""}

          ${t.treatment?`
          <div class="medical-section">
            <div class="medical-title">${a(i("print.consultation.treatment"))}</div>
            <div class="medical-content">${a(t.treatment)}</div>
          </div>
          `:""}

          ${t.notes?`
          <div class="medical-section">
            <div class="medical-title">${a(i("print.consultation.notes"))}</div>
            <div class="medical-content">${a(t.notes)}</div>
          </div>
          `:""}

          ${t.follow_up_date?`
          <div class="medical-section">
            <div class="medical-title">${a(i("print.consultation.followUp"))}</div>
            <div class="medical-content">
              <strong>${a(i("print.consultation.date"))}</strong> ${a(new Date(t.follow_up_date).toLocaleDateString(H(v.language)))}<br>
              ${t.follow_up_notes?`<strong>${a(i("print.consultation.notes"))}</strong> ${a(t.follow_up_notes)}`:""}
            </div>
          </div>
          `:""}

          ${t.cost?`
          <div class="medical-section">
            <div class="medical-title">${a(i("print.consultation.cost"))}</div>
            <div class="medical-content">
              <strong>${a(t.cost)} ${a(l.currency||"EUR")}</strong>
            </div>
          </div>
          `:""}

          <div class="footer">
            <p>${a(i("print.consultation.reportGenerated",{date:new Date().toLocaleDateString(H(v.language)),time:new Date().toLocaleTimeString(H(v.language))}))}</p>
            <p>${a(i("print.consultation.veterinarian"))} ${a(t.veterinarian_id||j)}</p>
          </div>
        </body>
      </html>
    `;d.document.open(),d.document.write(M),d.document.close(),d.onload=function(){try{setTimeout(()=>{d.focus(),d.print(),typeof d.onafterprint=="function"?d.onafterprint=function(){try{d.close()}catch(C){console.error("Error closing print window:",C)}}:setTimeout(()=>{try{d.close()}catch(C){console.error("Error closing print window after timeout:",C)}},2e3)},500)}catch(C){console.error("Error during print process:",C),alert(i("print.consultation.printError"))}}}catch(d){console.error("Error in print function:",d),alert(i("print.consultation.prepareError"))}};return e.jsxs(p,{size:"sm",variant:"outline",onClick:P,className:"gap-1",children:[e.jsx(es,{className:"h-3 w-3"}),$("print")]})}const ys=async t=>{try{const{data:{user:l},error:x}=await y.auth.getUser();if(x||!l)return console.error("Authentication error:",x),{success:!1,message:"User not authenticated"};const{data:i,error:v}=await y.from("consultations").select("id, animal_id, client_id, veterinarian_id").eq("id",t).single();if(v)return console.error(`Consultation not found: ${v.message}`),{success:!1,message:`Consultation not found: ${v.message}`};const{data:$,error:P}=await y.from("prescriptions").select("id").eq("consultation_id",t);if(P)console.warn(`Could not fetch prescriptions: ${P.message}`);else if($&&$.length>0)for(const r of $){const{error:o}=await y.from("prescription_medications").delete().eq("prescription_id",r.id);o&&console.warn(`Could not delete medications for prescription ${r.id}: ${o.message}`)}const{error:g}=await y.from("prescriptions").delete().eq("consultation_id",t);g&&console.warn(`Could not delete prescriptions: ${g.message}`);const S=["vaccinations","lab_results","antiparasitics"];for(const r of S)try{const{error:o}=await y.from(r).delete().eq("consultation_id",t);o&&console.warn(`Could not delete from ${r}: ${o.message}`)}catch(o){console.warn(`Error with ${r}:`,o)}try{const{removeVisitLinkForConsultation:r}=await fs(async()=>{const{removeVisitLinkForConsultation:o}=await import("./consultationVisitSync-q_gAF8aZ.js");return{removeVisitLinkForConsultation:o}},__vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10,11]));await r(t)}catch(r){console.warn("Could not unlink visit service for consultation",r)}const{error:u}=await y.from("consultations").delete().eq("id",t);return u?(console.error(`FAILED to delete consultation: ${u.message}`),{success:!1,message:`Failed to delete consultation: ${u.message}`}):{success:!0}}catch(l){return console.error("❌ CRITICAL ERROR during deletion:",l),{success:!1,message:`Critical error: ${(l==null?void 0:l.message)||"Unknown error"}`}}},mt=()=>{var de;const{t}=B("app"),{t:l}=B("common"),{bcp47:x}=ke(),{data:i=[],isLoading:v}=xs(),{data:$=[]}=ps();us(),hs();const P=gs();ge();const{toast:g}=Ae(),{currentView:S}=ms("consultations"),{canWrite:u,guardWrite:r}=Cs("can_create_consultations"),[o,z]=c.useState(""),[k,q]=c.useState(bs),[E,d]=c.useState(S),[a,A]=c.useState(!1),[j,R]=c.useState(!1),[M,C]=c.useState(null),[fe,Z]=c.useState(null),[ve,ee]=c.useState(!1),[se,je]=c.useState(null),[te,we]=c.useState(null),[Ne,ae]=c.useState(!1),[W,ie]=c.useState([]),[be,$e]=c.useState(""),[Ce,ne]=c.useState(!1),[ye,le]=c.useState(null),[_e,T]=c.useState(!1),[w,L]=c.useState(null),G=s=>$.filter(m=>m.consultation_id===s),O=i.filter(s=>{var f,h,b;const m=`${((f=s.client)==null?void 0:f.first_name)||""} ${((h=s.client)==null?void 0:h.last_name)||""}`.trim(),n=((b=s.animal)==null?void 0:b.name)||"";return(m.toLowerCase().includes(o.toLowerCase())||n.toLowerCase().includes(o.toLowerCase())||s.symptoms&&s.symptoms.toLowerCase().includes(o.toLowerCase())||s.diagnosis&&s.diagnosis.toLowerCase().includes(o.toLowerCase()))&&$s(s.consultation_date,k)}),re=s=>{r()&&(C(s),R(!0))},oe=s=>{r()&&(je(s.animal_id),we(s.id),ee(!0))},ce=s=>{r()&&(L(s),T(!0))},De=async()=>{if(r()&&w)try{if((await ys(w.id)).success){g({title:t("consultations.deleted"),description:t("consultations.deleted")}),window.location.reload(),T(!1),L(null);return}P.mutate(w.id,{onSuccess:()=>{g({title:t("consultations.deleted"),description:t("consultations.deleted")}),T(!1),L(null)},onError:m=>{g({title:l("error"),description:`${t("consultations.cannotDelete")}: ${m.message}`,variant:"destructive"}),T(!1),L(null)}})}catch(s){g({title:l("error"),description:`${l("unexpectedError")} ${s.message||l("unknown")}`,variant:"destructive"}),T(!1),L(null)}},Pe=s=>{r()&&(Z({clientId:s.client_id,animalId:s.animal_id,consultation_date:new Date().toISOString(),consultation_type:"follow-up",symptoms:"",diagnosis:"",treatment:"",notes:t("consultations.followUpNote",{date:new Date(s.consultation_date).toLocaleDateString(x)}),status:"scheduled"}),A(!0))},Se=s=>{var n;const m=G(s.id);ie(m),$e(((n=s.animal)==null?void 0:n.name)||t("consultations.unknownPet")),ae(!0)};return e.jsxs("div",{className:"container mx-auto px-4 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-8",children:[e.jsx(Je,{icon:Y,title:t("consultations.title"),description:t("consultations.description"),actions:e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"flex border rounded-full p-1 bg-muted/50",children:[e.jsx(p,{variant:E==="cards"?"default":"ghost",size:"sm",onClick:()=>d("cards"),className:"rounded-full px-3",children:e.jsx(ss,{className:"h-4 w-4"})}),e.jsx(p,{variant:E==="table"?"default":"ghost",size:"sm",onClick:()=>d("table"),className:"rounded-full px-3",children:e.jsx(ts,{className:"h-4 w-4"})})]}),u&&e.jsxs(p,{size:"sm",className:"gap-1 sm:gap-2 rounded-full",onClick:()=>{r()&&A(!0)},children:[e.jsx(as,{className:"h-4 w-4"}),e.jsx("span",{className:"text-xs sm:text-sm",children:t("consultations.new")})]})]})}),e.jsxs(F,{children:[e.jsx(me,{children:e.jsxs(xe,{className:"flex items-center gap-2 text-base sm:text-lg",children:[e.jsx(is,{className:"h-4 sm:h-5 w-4 sm:w-5"}),l("searchAndFilter")]})}),e.jsx(I,{className:"space-y-4",children:e.jsxs("div",{className:"flex w-full flex-col gap-3 sm:gap-4",children:[e.jsx(Fe,{placeholder:t("consultations.searchPlaceholder"),value:o,onChange:s=>z(s.target.value),className:"w-full sm:max-w-md"}),e.jsx(Ns,{value:k,onChange:q,idPrefix:"consultations-date"})]})})]}),e.jsxs("div",{className:"space-y-4","data-tour":"consultations-list",children:[e.jsxs("h3",{className:"text-base sm:text-lg font-semibold",children:[t("consultations.title")," (",O.length,")"]}),O.length===0?e.jsx(F,{children:e.jsxs(I,{className:"p-6 sm:p-8 text-center text-muted-foreground",children:[e.jsx(Y,{className:"h-10 sm:h-12 w-10 sm:w-12 mx-auto mb-4 text-muted-foreground/50"}),e.jsx("p",{className:"text-sm sm:text-base",children:t("consultations.empty")}),e.jsx("p",{className:"text-xs sm:text-sm",children:t("consultations.emptyHint")})]})}):E==="cards"?O.map(s=>{var m,n,N;return e.jsx(F,{className:"card-hover",children:e.jsx(I,{className:"p-4 sm:p-6",children:e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{className:"flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsxs("div",{className:"flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4",children:[e.jsx("h4",{className:"text-base sm:text-lg font-semibold",children:((m=s.animal)==null?void 0:m.name)||t("consultations.unknownPet")}),e.jsx(V,{variant:"secondary",className:"w-fit",children:t("consultations.title")}),s.visit_id&&e.jsx(V,{variant:"outline",className:"w-fit",children:t("consultations.linkedVisit")}),e.jsx("span",{className:"text-xs sm:text-sm text-muted-foreground",children:new Date(s.consultation_date).toLocaleDateString(x)})]}),e.jsxs("div",{className:"flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-xs sm:text-sm text-muted-foreground",children:[e.jsxs("div",{className:"flex items-center gap-1",children:[e.jsx(ns,{className:"h-3 sm:h-4 w-3 sm:w-4"}),(n=s.client)==null?void 0:n.first_name," ",(N=s.client)==null?void 0:N.last_name]}),e.jsxs("div",{className:"flex items-center gap-1",children:[e.jsx(Y,{className:"h-3 w-3"}),"Consultation #",s.id]})]})]}),e.jsxs("div",{className:"flex items-center gap-2 sm:gap-4 text-xs sm:text-sm",children:[s.temperature&&e.jsxs("div",{className:"flex items-center gap-1",children:[e.jsx(ls,{className:"h-3 sm:h-4 w-3 sm:w-4 text-primary"}),X(s.temperature,"-")]}),s.weight&&e.jsxs("span",{children:[s.weight," kg"]})]})]}),e.jsxs("div",{className:"grid gap-4 grid-cols-1 sm:grid-cols-2",children:[e.jsxs("div",{className:"space-y-2",children:[s.symptoms&&e.jsxs(e.Fragment,{children:[e.jsxs("h5",{className:"font-medium text-sm sm:text-base",children:[t("consultations.clinical.symptoms"),":"]}),e.jsx("p",{className:"text-xs sm:text-sm",children:s.symptoms})]}),s.diagnosis&&e.jsxs(e.Fragment,{children:[e.jsxs("h5",{className:"font-medium text-sm sm:text-base",children:[t("consultations.clinical.diagnosis"),":"]}),e.jsx("p",{className:"text-xs sm:text-sm",children:s.diagnosis})]})]}),e.jsxs("div",{className:"space-y-2",children:[s.treatment&&e.jsxs(e.Fragment,{children:[e.jsxs("h5",{className:"font-medium text-sm sm:text-base",children:[t("consultations.clinical.treatment"),":"]}),e.jsx("p",{className:"text-xs sm:text-sm",children:s.treatment})]}),(()=>{const f=G(s.id);return f.length>0&&e.jsxs(e.Fragment,{children:[e.jsxs("h5",{className:"font-medium flex items-center gap-1 text-sm sm:text-base",children:[e.jsx(U,{className:"h-3 sm:h-4 w-3 sm:w-4"}),t("consultations.prescription.title")," (",f.length,"):"]}),e.jsx("div",{className:"space-y-1",children:f.map(h=>e.jsx("div",{className:"text-xs sm:text-sm bg-blue-50 p-2 rounded border-l-2 border-blue-200",children:e.jsxs("div",{className:"flex items-start justify-between gap-2",children:[e.jsxs("div",{className:"min-w-0",children:[e.jsxs("div",{className:"font-medium text-blue-800",children:["Prescription #",h.id.slice(-8)]}),e.jsxs("div",{className:"text-blue-600 text-xs",children:[new Date(h.prescription_date).toLocaleDateString(x)," - Status: ",h.status]}),h.medications&&h.medications.length>0&&e.jsxs("div",{className:"mt-1",children:[e.jsxs("div",{className:"text-xs font-medium text-blue-700",children:[t("consultations.medications"),":"]}),h.medications.map((b,Ee)=>e.jsxs("div",{className:"text-xs text-blue-600 ml-2",children:["• ",b.medication_name," ",b.dosage&&`- ${b.dosage}`," ",b.quantity&&`(${b.quantity})`]},Ee))]})]}),e.jsx(K,{prescription:Q(h),compact:!0})]})},h.id))})]})})()]})]}),s.notes&&e.jsxs("div",{className:"space-y-2",children:[e.jsxs("h5",{className:"font-medium text-sm sm:text-base",children:[t("consultations.notes"),":"]}),e.jsx("p",{className:"text-xs sm:text-sm bg-muted p-2 sm:p-3 rounded",children:s.notes})]}),e.jsxs("div",{className:"flex flex-col sm:flex-row sm:items-center sm:justify-between pt-2 border-t gap-2",children:[e.jsxs("span",{className:"text-xs sm:text-sm text-muted-foreground",children:[e.jsx(rs,{className:"h-3 w-3 inline mr-1"}),s.followUp?t("consultations.followUp",{date:s.followUp}):t("consultations.noFollowUp")]}),e.jsxs("div",{className:"flex flex-wrap gap-2",children:[e.jsx(he,{consultation:s}),u&&e.jsxs(e.Fragment,{children:[e.jsxs(p,{size:"sm",variant:"outline",onClick:()=>re(s),className:"gap-1 text-xs sm:text-sm",children:[e.jsx(J,{className:"h-3 w-3"}),l("edit")]}),e.jsxs(p,{size:"sm",variant:"default",onClick:()=>oe(s),className:"gap-1 text-xs sm:text-sm",children:[e.jsx(U,{className:"h-3 w-3"}),t("consultations.prescription.title")]}),e.jsxs(p,{size:"sm",variant:"outline",onClick:()=>ce(s),className:"gap-1 text-red-600 hover:text-red-700 hover:bg-red-50",children:[e.jsx(pe,{className:"h-3 w-3"}),l("delete")]}),e.jsx(p,{size:"sm",onClick:()=>Pe(s),className:"text-xs sm:text-sm",children:t("consultations.newFollowUp")})]})]})]})]})})},s.id)}):e.jsx(F,{children:e.jsx(I,{className:"p-0",children:e.jsx("div",{className:"overflow-x-auto",children:e.jsxs(vs,{children:[e.jsx(js,{children:e.jsxs(ue,{children:[e.jsxs(_,{className:"text-xs sm:text-sm",children:[t("consultations.columns.pet")," / ",t("consultations.columns.client")]}),e.jsx(_,{className:"text-xs sm:text-sm",children:t("consultations.columns.date")}),e.jsx(_,{className:"text-xs sm:text-sm",children:t("consultations.clinical.symptoms")}),e.jsx(_,{className:"text-xs sm:text-sm",children:t("consultations.columns.diagnosis")}),e.jsx(_,{className:"text-xs sm:text-sm",children:t("consultations.clinical.vitals")}),e.jsx(_,{className:"text-xs sm:text-sm",children:t("consultations.prescription.title")}),e.jsx(_,{className:"text-xs sm:text-sm",children:t("consultations.columns.actions")})]})}),e.jsx(ws,{children:O.map(s=>{var m,n,N;return e.jsxs(ue,{children:[e.jsx(D,{className:"text-xs sm:text-sm",children:e.jsxs("div",{children:[e.jsx("div",{className:"font-medium",children:(m=s.animal)==null?void 0:m.name}),e.jsxs("div",{className:"text-xs text-muted-foreground",children:[(n=s.client)==null?void 0:n.first_name," ",(N=s.client)==null?void 0:N.last_name]})]})}),e.jsx(D,{className:"text-xs sm:text-sm",children:new Date(s.consultation_date).toLocaleDateString(x)}),e.jsx(D,{className:"text-xs sm:text-sm",children:e.jsx("div",{className:"max-w-xs truncate",children:s.symptoms||"-"})}),e.jsx(D,{className:"text-xs sm:text-sm",children:e.jsx("div",{className:"max-w-xs truncate",children:s.diagnosis||"-"})}),e.jsx(D,{className:"text-xs sm:text-sm",children:s.temperature?X(s.temperature):"-"}),e.jsx(D,{className:"text-xs sm:text-sm",children:(()=>{const f=G(s.id);return f.length>0?e.jsx("div",{className:"space-y-1",children:e.jsxs("div",{className:"flex items-center gap-2 cursor-pointer p-1 rounded transition-colors w-fit",onClick:()=>Se(s),title:t("consultations.prescriptionTooltip"),children:[e.jsxs(V,{variant:"outline",className:"text-xs",children:[f.length," prescription",f.length>1?"s":""]}),e.jsx(os,{className:"h-3 w-3 text-blue-600 hover:text-blue-800"})]})}):e.jsx("span",{className:"text-muted-foreground text-xs",children:l("none")})})()}),e.jsx(D,{className:"text-xs sm:text-sm",children:e.jsxs("div",{className:"flex gap-1 flex-wrap",children:[e.jsx(he,{consultation:s}),u&&e.jsxs(e.Fragment,{children:[e.jsx(p,{size:"sm",variant:"outline",onClick:()=>re(s),title:t("consultations.tooltips.edit"),children:e.jsx(J,{className:"h-3 w-3"})}),e.jsx(p,{size:"sm",variant:"default",onClick:()=>oe(s),title:t("consultations.prescription.new"),children:e.jsx(U,{className:"h-3 w-3"})}),e.jsx(p,{size:"sm",variant:"outline",onClick:()=>ce(s),className:"text-red-600 hover:text-red-700 hover:bg-red-50",title:t("consultations.tooltips.delete"),children:e.jsx(pe,{className:"h-3 w-3"})})]})]})})]},s.id)})})]})})})})]}),e.jsx(Ke,{open:a,onOpenChange:s=>{A(s),s||Z(null)},prefillData:fe||void 0}),e.jsx(Qe,{open:j,onOpenChange:R,consultation:M}),se&&te&&e.jsx(cs,{open:ve,onOpenChange:ee,petId:se,consultationId:te}),e.jsx(ds,{open:Ce,onOpenChange:s=>{ne(s),s||le(null)},prescription:ye,onUpdated:s=>{ie(m=>m.map(n=>n.id===s.id?{...n,...s}:n))}}),e.jsx(Ie,{open:Ne,onOpenChange:ae,children:e.jsxs(Ue,{className:"max-w-full sm:max-w-4xl max-h-[80vh] overflow-y-auto mx-4",children:[e.jsxs(ze,{children:[e.jsxs(qe,{className:"flex items-center gap-2 text-base sm:text-lg",children:[e.jsx(U,{className:"h-4 sm:h-5 w-4 sm:w-5"}),"Prescriptions pour ",be]}),e.jsx(Re,{className:"text-sm",children:t("consultations.prescriptionDetailsTitle",{count:W.length})})]}),e.jsxs("div",{className:"space-y-4 sm:space-y-6",children:[W.map((s,m)=>e.jsxs(F,{className:"border-l-4 border-l-primary",children:[e.jsxs(me,{className:"pb-3",children:[e.jsxs("div",{className:"flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2",children:[e.jsxs(xe,{className:"text-base sm:text-lg",children:["Prescription #",s.id.slice(-8)]}),e.jsxs("div",{className:"flex flex-wrap items-center gap-2",children:[e.jsx(V,{variant:s.status==="active"?"default":s.status==="completed"?"secondary":"destructive",className:"text-xs w-fit",children:s.status}),u&&e.jsxs(p,{type:"button",variant:"outline",size:"sm",className:"h-8",onClick:()=>{r()&&(le(s),ne(!0))},children:[e.jsx(J,{className:"h-4 w-4 mr-1"}),l("edit")]}),e.jsx(K,{prescription:Q(s),compact:!0})]})]}),e.jsxs("div",{className:"text-xs sm:text-sm text-muted-foreground",children:["Date: ",new Date(s.prescription_date).toLocaleDateString(x)," à ",new Date(s.prescription_date).toLocaleTimeString(x),s.valid_until&&e.jsxs("span",{className:"ml-0 sm:ml-4 block sm:inline",children:["Valide jusqu'au: ",new Date(s.valid_until).toLocaleDateString(x)]})]})]}),e.jsxs(I,{className:"space-y-4",children:[s.diagnosis&&e.jsxs("div",{children:[e.jsxs("h4",{className:"font-medium text-sm mb-1",children:[t("consultations.clinical.diagnosis"),":"]}),e.jsx("p",{className:"text-sm bg-muted p-2 rounded",children:s.diagnosis})]}),s.medications&&s.medications.length>0&&e.jsxs("div",{children:[e.jsxs("h4",{className:"font-medium text-sm mb-2",children:[t("consultations.medications")," (",s.medications.length,"):"]}),e.jsx("div",{className:"grid gap-3 grid-cols-1 sm:grid-cols-2",children:s.medications.map((n,N)=>e.jsxs("div",{className:"bg-muted p-3 rounded-lg",children:[e.jsx("div",{className:"font-medium text-sm",children:n.medication_name}),e.jsxs("div",{className:"text-xs space-y-1 mt-1",children:[n.dosage&&e.jsxs("div",{children:[t("consultations.dosage"),": ",n.dosage]}),n.frequency&&e.jsxs("div",{children:[t("consultations.frequency"),": ",n.frequency]}),n.duration&&e.jsxs("div",{children:[t("consultations.duration"),": ",n.duration]}),n.quantity&&e.jsxs("div",{children:[t("consultations.quantity"),": ",n.quantity]}),n.route&&e.jsxs("div",{children:[t("consultations.route"),": ",n.route]})]}),n.instructions&&e.jsxs("div",{className:"mt-2 text-xs bg-background p-2 rounded border",children:[e.jsx("span",{className:"font-medium",children:"Instructions: "}),n.instructions]})]},N))})]}),s.notes&&e.jsxs("div",{children:[e.jsxs("h4",{className:"font-medium text-sm mb-1",children:[t("consultations.notes"),":"]}),e.jsx("p",{className:"text-sm bg-muted p-2 rounded",children:s.notes})]}),e.jsxs("div",{className:"flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 text-xs text-muted-foreground pt-2 border-t",children:[e.jsxs("div",{className:"flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4",children:[e.jsxs("span",{children:["Renouvellements: ",s.refill_count||0]}),e.jsxs("span",{children:[t("consultations.createdAt"),": ",new Date(s.created_at).toLocaleDateString(x)]}),s.updated_at!==s.created_at&&e.jsxs("span",{children:[t("consultations.updatedAt"),": ",new Date(s.updated_at).toLocaleDateString(x)]})]}),e.jsx(K,{prescription:Q(s)})]})]})]},s.id)),W.length===0&&e.jsxs("div",{className:"text-center py-8 text-muted-foreground",children:[e.jsx(U,{className:"h-10 sm:h-12 w-10 sm:w-12 mx-auto mb-4 text-muted-foreground/50"}),e.jsx("p",{className:"text-sm",children:t("consultations.noPrescriptions")})]})]})]})}),e.jsx(Oe,{open:_e,onOpenChange:T,children:e.jsxs(He,{children:[e.jsxs(Ve,{children:[e.jsx(Be,{children:t("consultations.deleteConfirmTitle")}),e.jsxs(Me,{children:[t("consultations.deleteConfirmBody")," "," ",e.jsx("strong",{children:((de=w==null?void 0:w.animal)==null?void 0:de.name)||"cet animal"})," ?",e.jsx("br",{}),e.jsxs("span",{className:"text-sm text-muted-foreground mt-2 block",children:[t("consultations.columns.date"),": ",w&&new Date(w.consultation_date).toLocaleDateString(x)]}),e.jsx("br",{}),l("cannotUndo")]})]}),e.jsxs(We,{children:[e.jsx(Ge,{onClick:()=>L(null),children:l("cancel")}),e.jsx(Ye,{onClick:De,className:"bg-red-600 hover:bg-red-700",children:l("delete")})]})]})})]})};export{mt as default};
