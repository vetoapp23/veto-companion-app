import{r as h,j as e}from"./vendor-react-Cg95Wd9j.js";import{j as na,v as le,w as ce,x as oe,y as de,z as b,B as f,O as ka,P as ra,l as Ta,V as Ae,W as Ra,C as R,r as _,o as ue,p as fe}from"./index-CfItjhrY.js";import{B as ne}from"./badge-Caayft07.js";import{I as Y}from"./input-qLGQSVB6.js";import{T as _a,a as La,b as Ke,c as X,d as Fa,e as Z}from"./table-B9J0YKJW.js";import{T as Pa,a as Ia,b as De,c as ke}from"./tabs-bz5exIdj.js";import{A as Ve,a as We}from"./avatar-DiMOl2Sv.js";import{u as qa}from"./use-display-preference-BVx8ut0J.js";import{u as la,h as Ma}from"./useAppSettings--ZabGHF6.js";import{V as za,W as Ba,a as ca,u as oa,d as da,n as Ea,e as Ua,X as Oa,Y as Ka,A as Va,Z as Wa,t as Ha,B as He}from"./useDatabase-DjoDdym8.js";import{u as Ya}from"./vendor-query-DQiNoSWI.js";import{D as _e,a as Le,b as Fe,c as Pe}from"./dialog-CrbbowE9.js";import{A as Qa}from"./AppPageHeader-38EskyZP.js";import{L as Ja}from"./ListDateFilter-BKU_GdCq.js";import{D as Xa,m as Za}from"./accountingLedger-DXLfxz20.js";import{N as Ye}from"./NewAntiparasiticModalDynamic-1l0Dfybm.js";import{L}from"./label-SblnkU2y.js";import{T as Ga}from"./textarea-DJGQrIav.js";import{S as es}from"./switch-DEihFsEb.js";import{B as as}from"./BoosterScheduleEditor-PkcuH78u.js";import{C as Qe}from"./combobox-freetext-Ct4H1Zm3.js";import{u as me}from"./vendor-i18n-02tLOPTM.js";import{j as ve,L as G,ar as Je,B as Xe,a2 as Ze,R as Ge,a8 as re,T as ma,r as ea,C as Ie,ai as ss,ah as ts,a3 as aa,aq as is,t as sa,E as ta,a6 as je,aj as ia,s as ns,U as rs}from"./vendor-icons-B9J2mvrK.js";import{C as ls}from"./checkbox-CUKavNMH.js";import{w as cs,b as os}from"./printWatermark-BmQ03DH8.js";import{q as ds}from"./medicalShare-Bl2RUBkT.js";import{q as pa,f as ms,h as ha,i as ps,p as ge,e as hs,s as xs}from"./reminderAppointments-KDrlEC7O.js";import{f as ee}from"./format-COjnugwY.js";import{u as us}from"./RoleGuard-DJSTCsxY.js";import"./vendor-charts-gQVxDXAv.js";import"./vendor-supabase-DVQeEGqo.js";import"./vendor-radix-SzILTRXJ.js";import"./stockMovements-CjzoeLC9.js";import"./quotaEnforcement-pio9jawb.js";import"./demoWriteGuard-BE3zI4l0.js";const fs=["spot_on","oral","injection","spray","collier","shampoing"];function js({open:s,onOpenChange:d,editingProtocol:t}){const{t:n}=me("medical"),{t:D}=me("common"),F=za(),P=Ba(),{toast:$}=na(),{data:O=[],isLoading:V}=la(),{data:Q=[],isLoading:ae}=Ma(),[l,q]=h.useState({species:"",parasiteType:"",productName:"",activeIngredient:"",administrationRoute:"",dosageRecommendation:"",frequencyDays:"",ageRecommendation:"",weightRange:"",seasonRecommendation:"",notes:"",active:!0}),[o,A]=h.useState([{label:n("forms.firstTreatmentLabel"),offset_days:0}]);h.useEffect(()=>{t&&(q({species:t.species,parasiteType:t.parasite_type,productName:t.product_name,activeIngredient:t.active_ingredient||"",administrationRoute:t.administration_route||"",dosageRecommendation:t.dosage_per_kg||"",frequencyDays:"",ageRecommendation:t.age_restriction||"",weightRange:"",seasonRecommendation:"",notes:t.notes||"",active:t.active}),t.booster_schedule&&t.booster_schedule.length>0&&A(t.booster_schedule))},[t]);const v=(c,r)=>{q(x=>({...x,[c]:r}))},k=()=>{q({species:"",parasiteType:"",productName:"",activeIngredient:"",administrationRoute:"",dosageRecommendation:"",frequencyDays:"",ageRecommendation:"",weightRange:"",seasonRecommendation:"",notes:"",active:!0})},W=async c=>{if(c.preventDefault(),!l.species||!l.parasiteType||!l.productName){$({title:D("error"),description:n("alerts.fillRequiredFields"),variant:"destructive"});return}try{const r={species:l.species,parasite_type:l.parasiteType,product_name:l.productName,active_ingredient:l.activeIngredient||void 0,administration_route:l.administrationRoute||void 0,dosage_per_kg:l.dosageRecommendation||void 0,frequency:l.frequencyDays?n("forms.frequencyDaysSuffix",{count:l.frequencyDays}):void 0,age_restriction:l.ageRecommendation||void 0,notes:[l.notes,l.weightRange?n("forms.weightNote",{range:l.weightRange}):"",l.seasonRecommendation?n("forms.seasonNote",{season:l.seasonRecommendation}):""].filter(Boolean).join(" | ")||void 0,active:l.active,booster_schedule:o.filter(x=>x.label.trim()).sort((x,w)=>x.offset_days-w.offset_days)};t?(await P.mutateAsync({id:t.id,updates:r}),$({title:D("success"),description:n("alerts.antiparasiticProtocolUpdated")})):(await F.mutateAsync(r),$({title:D("success"),description:n("alerts.antiparasiticProtocolCreated")})),k(),d(!1)}catch(r){console.error("Erreur lors de la sauvegarde du protocole:",r),$({title:D("error"),description:(r==null?void 0:r.message)||n("alerts.saveProtocolError"),variant:"destructive"})}},M=F.isPending||P.isPending;return e.jsx(_e,{open:s,onOpenChange:d,children:e.jsxs(Le,{className:"max-w-3xl max-h-[90vh] overflow-y-auto",children:[e.jsx(Fe,{children:e.jsxs(Pe,{className:"flex items-center gap-2",children:[e.jsx(ve,{className:"h-5 w-5"}),n(t?"forms.editProtocol":"forms.newAntiparasiticProtocol")]})}),e.jsxs("form",{onSubmit:W,className:"space-y-6",children:[e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-6",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsx(L,{htmlFor:"species",children:n("forms.speciesRequired")}),e.jsxs(le,{value:l.species,onValueChange:c=>v("species",c),children:[e.jsx(ce,{children:e.jsx(oe,{placeholder:n("forms.selectSpecies")})}),e.jsx(de,{children:O.map(c=>e.jsx(b,{value:c,children:c},c))})]})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(L,{htmlFor:"parasiteType",children:n("forms.parasiteTypeRequired")}),e.jsx(Qe,{value:l.parasiteType,onChange:c=>v("parasiteType",c),options:Q,category:"parasite_type",placeholder:n("forms.selectOrCreate")})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(L,{htmlFor:"productName",children:n("forms.productNameRequired")}),e.jsx(Y,{id:"productName",value:l.productName,onChange:c=>v("productName",c.target.value),placeholder:n("forms.productNameEx"),required:!0})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(L,{htmlFor:"activeIngredient",children:n("forms.activeIngredient")}),e.jsx(Y,{id:"activeIngredient",value:l.activeIngredient,onChange:c=>v("activeIngredient",c.target.value),placeholder:n("forms.activeIngredientEx")})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(L,{htmlFor:"administrationRoute",children:n("forms.administrationRoute")}),e.jsx(Qe,{value:l.administrationRoute,onChange:c=>v("administrationRoute",c),options:fs,category:"administration_route",placeholder:n("forms.selectOrCreate")})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(L,{htmlFor:"dosageRecommendation",children:n("forms.dosageRecommendation")}),e.jsx(Y,{id:"dosageRecommendation",value:l.dosageRecommendation,onChange:c=>v("dosageRecommendation",c.target.value),placeholder:n("forms.dosageRecommendationEx")})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(L,{htmlFor:"frequencyDays",children:n("forms.frequencyDays")}),e.jsx(Y,{id:"frequencyDays",type:"number",value:l.frequencyDays,onChange:c=>v("frequencyDays",c.target.value),placeholder:n("forms.frequencyDaysEx")})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(L,{htmlFor:"ageRecommendation",children:n("forms.ageRecommendation")}),e.jsx(Y,{id:"ageRecommendation",value:l.ageRecommendation,onChange:c=>v("ageRecommendation",c.target.value),placeholder:n("forms.ageRecommendationEx")})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(L,{htmlFor:"weightRange",children:n("forms.weightRange")}),e.jsx(Y,{id:"weightRange",value:l.weightRange,onChange:c=>v("weightRange",c.target.value),placeholder:n("forms.weightRangeEx")})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(L,{htmlFor:"seasonRecommendation",children:n("forms.seasonRecommendation")}),e.jsxs(le,{value:l.seasonRecommendation,onValueChange:c=>v("seasonRecommendation",c),children:[e.jsx(ce,{children:e.jsx(oe,{placeholder:n("forms.selectSeason")})}),e.jsxs(de,{children:[e.jsx(b,{value:"toute_annee",children:n("forms.seasonAllYear")}),e.jsx(b,{value:"printemps_ete",children:n("forms.seasonSpringSummer")}),e.jsx(b,{value:"automne_hiver",children:n("forms.seasonAutumnWinter")}),e.jsx(b,{value:"printemps",children:n("forms.seasonSpring")}),e.jsx(b,{value:"ete",children:n("forms.seasonSummer")}),e.jsx(b,{value:"automne",children:n("forms.seasonAutumn")}),e.jsx(b,{value:"hiver",children:n("forms.seasonWinter")})]})]})]})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(L,{htmlFor:"notes",children:D("notes")}),e.jsx(Ga,{id:"notes",value:l.notes,onChange:c=>v("notes",c.target.value),placeholder:n("forms.protocolNotesPlaceholder"),rows:3})]}),e.jsx(as,{value:o,onChange:A,title:n("forms.treatmentSchedule"),description:n("forms.treatmentScheduleDesc")}),e.jsxs("div",{className:"flex items-center space-x-2",children:[e.jsx(es,{id:"active",checked:l.active,onCheckedChange:c=>v("active",c)}),e.jsx(L,{htmlFor:"active",children:n("forms.protocolActive")})]}),e.jsxs("div",{className:"flex justify-end gap-3",children:[e.jsx(f,{type:"button",variant:"outline",onClick:()=>d(!1),children:D("cancel")}),e.jsxs(f,{type:"submit",disabled:M,children:[M&&e.jsx(G,{className:"h-4 w-4 mr-2 animate-spin"}),D(t?"edit":"create")]})]})]})]})})}function gs({animalId:s}){const{settings:d}=ka(),{t}=me("medical"),{dateFns:n}=ra(),{isFree:D}=Ta(),{data:F}=ca(),{data:P}=oa(),{data:$}=da(),{data:O=[]}=Ea(s),[V,Q]=h.useState(!0),[ae,l]=h.useState(!1),q=(d.veterinarians||[]).filter(r=>r.isActive!==!1),o=F==null?void 0:F.find(r=>r.id===s),A=o?P==null?void 0:P.find(r=>r.id===o.client_id):null,v=h.useMemo(()=>($==null?void 0:$.filter(r=>r.animal_id===s))||[],[$,s]),k=h.useMemo(()=>pa(v,O),[v,O]),W=r=>{const x=new Date(r),w=new Date;if(isNaN(x.getTime()))return"N/A";let H=w.getFullYear()-x.getFullYear(),i=w.getMonth()-x.getMonth(),z=w.getDate()-x.getDate();if(z<0){i--;const K=new Date(w.getFullYear(),w.getMonth(),0);z+=K.getDate()}i<0&&(H--,i+=12);const B=Math.floor(z/7),E=[];return H>0&&E.push(t("vaccinationCertificate.ageYears",{count:H})),i>0&&E.push(t("vaccinationCertificate.ageMonths",{count:i})),B>0&&E.push(t("vaccinationCertificate.ageWeeks",{count:B})),E.join(", ")||t("vaccinationCertificate.ageDays",{count:0})},M=async()=>{if(!o||!A){alert(t("alerts.missingAnimalClient"));return}l(!0);const r=window.open("",`antiparasitic_certificate_${o.id}`,"height=900,width=820");if(!r){l(!1),alert(t("alerts.printBlocked"));return}try{r.document.open(),r.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${Ae(t("antiparasiticCertificate.heading"))}</title></head><body style="font-family:Arial,sans-serif;padding:24px;color:#555;">${Ae(t("alerts.printPreparing",{defaultValue:"Preparing…"}))}</body></html>`),r.document.close();const x=ee(new Date,"PPp",{locale:n}),w=[t("antiparasiticCertificate.heading"),`${d.clinicName||t("vaccinationCertificate.clinicFallback")}`,`${o.name} · ${o.species}${o.breed?` · ${o.breed}`:""}`,o.microchip_number||o.chip_number?`Chip: ${o.microchip_number||o.chip_number}`:null,`${A.first_name} ${A.last_name}`,d.phone||d.email||d.website||"",x].filter(Boolean).join(`
`),H=await ds(w,160),i=Ae,z=Ra,B=k.filter(p=>p.status==="administered").length,E=k.filter(p=>p.status==="planned").length,K=k.length>0?`
            <table class="doses-table">
              <thead>
                <tr>
                  <th>${t("antiparasiticCertificate.cols.date")}</th>
                  <th>${t("antiparasiticCertificate.cols.product")}</th>
                  <th>${t("antiparasiticCertificate.cols.treatment")}</th>
                  <th>${t("antiparasiticCertificate.cols.status")}</th>
                  <th>${t("antiparasiticCertificate.cols.activeIngredient")}</th>
                </tr>
              </thead>
              <tbody>
                ${k.map(p=>`
                  <tr class="${p.status==="planned"?"row-planned":"row-done"}">
                    <td>${i(ms(p.date))}</td>
                    <td>
                      <strong>${i(p.vaccineName)}</strong>
                      ${p.vaccineType?`<div class="muted">${i(p.vaccineType)}</div>`:""}
                    </td>
                    <td>${i(p.doseLabel)}</td>
                    <td>
                      <span class="badge ${p.status==="planned"?"badge-planned":"badge-done"}">
                        ${p.status==="planned"?i(t("antiparasiticCertificate.statusPlanned")):i(t("antiparasiticCertificate.statusDone"))}
                      </span>
                    </td>
                    <td>${i(p.manufacturer||(p.status==="planned"?"—":"N/A"))}</td>
                  </tr>
                  ${p.notes?`<tr class="notes-row"><td colspan="5"><em>${i(t("antiparasiticCertificate.notes"))}</em> ${i(p.notes)}</td></tr>`:""}
                `).join("")}
              </tbody>
            </table>
            <p class="doses-summary">
              ${t("antiparasiticCertificate.summary",{done:B})}${E>0?t("antiparasiticCertificate.summaryPlanned",{planned:E}):""}
            </p>
          `:`<div class="no-vaccinations">
              <p>${t("antiparasiticCertificate.empty")}</p>
            </div>`,ye=`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <title>${i(t("antiparasiticCertificate.docTitle",{name:o.name}))}</title>
            <style>
              @page { size: A4; margin: 12mm; }
              * { box-sizing: border-box; }
              body {
                font-family: Arial, Helvetica, sans-serif;
                margin: 0;
                padding: 12px;
                line-height: 1.5;
                color: #333;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .header {
                display: flex;
                flex-direction: row;
                align-items: flex-start;
                justify-content: space-between;
                gap: 16px;
                border-bottom: 3px solid #2c5530;
                padding-bottom: 16px;
                margin-bottom: 24px;
              }
              .header-main {
                flex: 1;
                min-width: 0;
                text-align: center;
              }
              .header-main img {
                max-height: 70px;
                max-width: 180px;
                width: auto;
                object-fit: contain;
                margin-bottom: 8px;
              }
              .header h1 {
                color: #2c5530;
                font-size: 24px;
                margin: 8px 0 0;
                font-weight: bold;
              }
              .qr-section {
                flex: 0 0 auto;
                width: 104px;
                text-align: center;
              }
              .qr-section img {
                width: 100px;
                height: 100px;
                display: block;
                margin: 0 auto;
                border: 1px solid #e2e8f0;
                border-radius: 4px;
                background: #fff;
              }
              .qr-caption {
                margin-top: 4px;
                font-size: 9px;
                color: #64748b;
                line-height: 1.2;
              }
              .clinic-info {
                margin-bottom: 24px;
                padding: 14px;
                background-color: #f8f9fa;
                border-radius: 8px;
              }
              .clinic-info h2 {
                color: #2c5530;
                margin: 0 0 8px;
                font-size: 18px;
              }
              .animal-info {
                margin-bottom: 24px;
                padding: 16px;
                border: 2px solid #2c5530;
                border-radius: 8px;
              }
              .animal-info h2 {
                color: #2c5530;
                border-bottom: 2px solid #2c5530;
                padding-bottom: 8px;
                margin: 0 0 12px;
                font-size: 18px;
              }
              .animal-photo {
                text-align: center;
                margin-bottom: 16px;
              }
              .animal-photo img {
                width: 120px;
                height: 120px;
                object-fit: cover;
                border-radius: 50%;
                border: 3px solid #2c5530;
              }
              .info-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 10px 14px;
              }
              .info-item {
                display: flex;
                align-items: flex-start;
                gap: 8px;
                min-width: 0;
              }
              .info-label {
                font-weight: bold;
                min-width: 88px;
                color: #2c5530;
                flex-shrink: 0;
              }
              .info-value {
                color: #555;
                word-break: break-word;
              }
              .vaccinations-section { margin-bottom: 24px; }
              .vaccinations-section h2 {
                color: #2c5530;
                border-bottom: 2px solid #2c5530;
                padding-bottom: 8px;
                margin: 0 0 12px;
                font-size: 18px;
              }
              .table-wrap {
                width: 100%;
                overflow-x: auto;
                -webkit-overflow-scrolling: touch;
              }
              .doses-table {
                width: 100%;
                border-collapse: collapse;
                font-size: 12px;
                min-width: 480px;
              }
              .doses-table th,
              .doses-table td {
                border: 1px solid #d0d7d1;
                padding: 7px 8px;
                text-align: left;
                vertical-align: top;
              }
              .doses-table th {
                background: #e8f0e9;
                color: #2c5530;
              }
              .row-planned td { background: #fffaf0; }
              .muted {
                color: #777;
                font-size: 11px;
                font-weight: normal;
              }
              .badge {
                display: inline-block;
                padding: 2px 8px;
                border-radius: 999px;
                font-size: 11px;
                font-weight: 600;
              }
              .badge-done { background: #e6f4ea; color: #1e7a3a; }
              .badge-planned { background: #fff3cd; color: #8a6d1d; }
              .notes-row td {
                background: #fafafa;
                font-size: 11px;
                color: #555;
              }
              .doses-summary {
                margin-top: 10px;
                font-size: 12px;
                color: #555;
              }
              .vets-info {
                margin-bottom: 24px;
                padding: 14px;
                background-color: #f8f9fa;
                border-radius: 8px;
              }
              .vets-info h2 {
                color: #2c5530;
                margin: 0 0 10px;
                font-size: 18px;
              }
              .vet-item { margin-bottom: 6px; color: #666; }
              .footer {
                text-align: center;
                margin-top: 28px;
                padding-top: 14px;
                border-top: 1px solid #ddd;
                color: #888;
                font-size: 11px;
              }
              .no-vaccinations {
                text-align: center;
                color: #666;
                font-style: italic;
                padding: 32px 16px;
                border: 2px dashed #ddd;
                border-radius: 8px;
              }

              @media print {
                body { padding: 0; }
                .no-print { display: none !important; }
                .table-wrap { overflow: visible; }
                .doses-table { min-width: 0; }
                .row-planned td,
                .badge-done,
                .badge-planned,
                .doses-table th {
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
              }
              ${cs}
            </style>
          </head>
          <body>
            ${os(D)}
            <div class="header">
              <div class="header-main">
                ${d.logo?`<img src="${z(d.logo)}" alt="${i(t("vaccinationCertificate.clinicLogoAlt"))}" />`:""}
                <h1>${i(t("antiparasiticCertificate.heading"))}</h1>
              </div>
              <div class="qr-section">
                <img src="${z(H)}" width="100" height="100" alt="QR" />
                <div class="qr-caption">${i(t("vaccinationCertificate.qrCaption",{defaultValue:"Scan"}))}</div>
              </div>
            </div>

            ${d.showClinicInfo?`
            <div class="clinic-info">
              <h2>${i(d.clinicName||t("vaccinationCertificate.clinicFallback"))}</h2>
              <p><strong>${i(t("vaccinationCertificate.labels.address"))}</strong> ${i(d.address||"N/A")}</p>
              <p><strong>${i(t("vaccinationCertificate.labels.phone"))}</strong> ${i(d.phone||"N/A")} | <strong>${i(t("vaccinationCertificate.labels.email"))}</strong> ${i(d.email||"N/A")}</p>
              ${d.website?`<p><strong>${i(t("vaccinationCertificate.labels.website"))}</strong> ${i(d.website)}</p>`:""}
            </div>
            `:""}

            ${d.showVetsInfo&&q.length>0?`
            <div class="vets-info">
              <h2>${t("vaccinationCertificate.vetTeam")}</h2>
              ${q.map(p=>`
                <div class="vet-item">
                  <strong>${i(p.title||"Dr.")} ${i(p.name)}</strong>
                  ${p.specialty?` - ${i(p.specialty)}`:""}
                </div>
              `).join("")}
            </div>
            `:""}

            <div class="animal-info">
              <h2>${t("vaccinationCertificate.animalInfo")}</h2>
              ${V&&o.photo_url?`
              <div class="animal-photo">
                <img src="${z(o.photo_url)}" alt="${i(t("vaccinationCertificate.animalPhotoAlt",{name:o.name}))}" />
              </div>
              `:""}
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">${t("vaccinationCertificate.labels.name")}</span>
                  <span class="info-value">${i(o.name)}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">${i(t("vaccinationCertificate.labels.species"))}</span>
                  <span class="info-value">${i(o.species)}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">${i(t("vaccinationCertificate.labels.breed"))}</span>
                  <span class="info-value">${i(o.breed||"N/A")}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">${i(t("vaccinationCertificate.labels.age"))}</span>
                  <span class="info-value">${i(o.birth_date?W(o.birth_date):"N/A")}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">${i(t("vaccinationCertificate.labels.sex"))}</span>
                  <span class="info-value">${i(o.sex||"N/A")}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">${i(t("vaccinationCertificate.labels.weight"))}</span>
                  <span class="info-value">${i(o.weight?o.weight+" kg":"N/A")}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">${i(t("vaccinationCertificate.labels.owner"))}</span>
                  <span class="info-value">${i(A.first_name)} ${i(A.last_name)}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">${i(t("vaccinationCertificate.labels.contact"))}</span>
                  <span class="info-value">${i(A.phone||A.email||"N/A")}</span>
                </div>
              </div>
            </div>

            <div class="vaccinations-section">
              <h2>${t("antiparasiticCertificate.scheduleTitle")}</h2>
              <div class="table-wrap">${K}</div>
            </div>

            <div class="footer">
              <p>${i(t("vaccinationCertificate.generatedAt",{datetime:x}))}</p>
              <p>${i(t("vaccinationCertificate.footerSystem"))}</p>
            </div>

            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.focus();
                  window.print();
                }, 350);
              };
            <\/script>
          </body>
        </html>
      `;r.document.open(),r.document.write(ye),r.document.close()}catch(x){console.error("Erreur lors de l'impression:",x);try{r.close()}catch{}alert(t("alerts.printError"))}finally{l(!1)}};if(!o||!A)return e.jsxs(f,{variant:"outline",disabled:!0,size:"sm",className:"w-full sm:w-auto justify-center",children:[e.jsx(Je,{className:"h-4 w-4 mr-2 shrink-0"}),e.jsx("span",{className:"sm:hidden",children:t("antiparasiticCertificate.buttonShort")}),e.jsx("span",{className:"hidden sm:inline",children:t("antiparasiticCertificate.button")})]});const c=!!o.photo_url;return e.jsxs("div",{className:"flex flex-col gap-2 w-full sm:w-auto",children:[c&&e.jsxs("label",{className:"flex items-center gap-2 text-xs sm:text-sm cursor-pointer",children:[e.jsx(ls,{checked:V,onCheckedChange:r=>Q(r===!0)}),e.jsx("span",{children:t("vaccinationCertificate.includeAnimalPhoto")})]}),e.jsxs(f,{variant:"outline",size:"sm",className:"w-full sm:w-auto justify-center",onClick:()=>void M(),disabled:ae,children:[e.jsx(Je,{className:"h-4 w-4 mr-2 shrink-0"}),e.jsxs("span",{className:"sm:hidden",children:[t("antiparasiticCertificate.buttonShort"),k.length>0?` (${k.length})`:""]}),e.jsxs("span",{className:"hidden sm:inline",children:[t("antiparasiticCertificate.button"),k.length>0?` (${k.length})`:""]})]})]})}function vs(s){if(s.status==="administered")return"administered";const d=ha();return s.date<d?"overdue":"planned"}const Te=s=>{switch(s){case"administered":return"bg-green-100 text-green-800 border-green-200";case"overdue":return"bg-red-100 text-red-800 border-red-200";case"planned":return"bg-blue-100 text-blue-800 border-blue-200";default:return"bg-gray-100 text-gray-800 border-gray-200"}},Re=s=>{switch(s){case"administered":return e.jsx(re,{className:"h-4 w-4"});case"overdue":return e.jsx(ma,{className:"h-4 w-4"});case"planned":return e.jsx(Ie,{className:"h-4 w-4"});default:return e.jsx(Ie,{className:"h-4 w-4"})}};function st(){const{t:s}=me("app"),{t:d}=me("common"),{dateFns:t}=ra(),n=a=>s(`antiparasites.status.${a}`),{currentView:D}=qa("antiparasitics"),{data:F=[],isLoading:P}=da(),{data:$=[],isLoading:O}=Ua(),{data:V=[],isLoading:Q}=Oa(),{data:ae=[],isLoading:l}=ca(),{data:q=[],isLoading:o}=oa(),A=Ka(),v=Va();Wa();const k=Ha(),W=Ya(),{toast:M}=na(),{data:c=[]}=la(),{canWrite:r,guardWrite:x}=us("can_manage_antiparasites"),[w,H]=h.useState(""),[i,z]=h.useState("all"),[B,E]=h.useState("all"),[K,ye]=h.useState("all"),[p,xa]=h.useState(Xa),[ua,qe]=h.useState(!1),[fa,pe]=h.useState(!1),[ja,se]=h.useState(!1),[u,Ne]=h.useState(null),[ga,he]=h.useState(!1),[be,Me]=h.useState(null),[va,ze]=h.useState(null),[ya,we]=h.useState(null),[Na,Ce]=h.useState(!1),[J,Be]=h.useState(null),Se=a=>{x()&&(we(a),Ce(!0),se(!1))},I=h.useMemo(()=>{if(P||l||o||O)return[];const a=new Map;for(const m of F){const j=a.get(m.animal_id)||[];j.push(m),a.set(m.animal_id,j)}const g=$.filter(m=>m.animal_id&&m.status!=="cancelled"&&m.status!=="no-show"&&(m.appointment_type==="follow-up"||m.appointment_type==="vaccination")),T=new Map;for(const m of g){if(!m.animal_id)continue;const j=T.get(m.animal_id)||[];j.push(m),T.set(m.animal_id,j)}const y=new Set([...a.keys(),...T.keys()]),U=[];for(const m of y){const j=ae.find(C=>C.id===m),N=q.find(C=>C.id===(j==null?void 0:j.client_id)),ie=(j==null?void 0:j.name)||s("antiparasites.unknownPet"),xe=N?`${N.first_name} ${N.last_name}`:s("antiparasites.unknownClient"),Ue=a.get(m)||[],Sa=T.get(m)||[],$a=pa(Ue,Sa);for(const C of $a){const Aa=vs(C),Da=C.vaccinationId?Ue.find(Oe=>Oe.id===C.vaccinationId&&(Oe.treatment_date||"").slice(0,10)===C.date):void 0;U.push({...C,rowKey:`${C.source||"x"}-${C.vaccinationId||C.appointmentId||C.date}-${C.doseLabel}-${C.vaccineName}`,animalId:m,petName:ie,clientName:xe,species:j==null?void 0:j.species,listStatus:Aa,treatmentRecord:Da})}}return U.sort((m,j)=>j.date.localeCompare(m.date)||m.petName.localeCompare(j.petName))},[F,$,ae,q,P,O,l,o,s]),S=h.useMemo(()=>{const a=I.length,g=I.filter(N=>N.listStatus==="administered").length,T=I.filter(N=>N.listStatus==="overdue").length,y=I.filter(N=>N.listStatus==="planned").length,U=ha(),m=I.filter(N=>{if(N.listStatus!=="planned")return!1;const ie=ee(ps(ge(U),30),"yyyy-MM-dd");return N.date>=U&&N.date<=ie}).length,j=I.reduce((N,ie)=>{const xe=ie.vaccineType||s("antiparasites.notSpecified");return N[xe]=(N[xe]||0)+1,N},{});return{total:a,administered:g,overdue:T,planned:y,upcoming:m,parasiteTypes:j}},[I,s]),te=h.useMemo(()=>I.filter(a=>{const g=a.petName.toLowerCase().includes(w.toLowerCase())||a.clientName.toLowerCase().includes(w.toLowerCase())||a.vaccineName.toLowerCase().includes(w.toLowerCase()),T=i==="all"||a.listStatus===i||i==="completed"&&a.listStatus==="administered"||i==="scheduled"&&a.listStatus==="planned"||i==="upcoming"&&a.listStatus==="planned",y=B==="all"||a.vaccineType===B,U=K==="all"||a.species===K,m=Za(a.date,p);return g&&T&&y&&U&&m}),[I,w,i,B,K,p]),Ee=a=>{x()&&(Me(a),he(!0))},ba=async()=>{if(x()&&be)try{await A.mutateAsync(be.id),M({title:s("antiparasites.deletedTitle"),description:s("antiparasites.deletedBody")}),he(!1),Me(null)}catch{M({title:d("error"),description:s("antiparasites.cannotDelete"),variant:"destructive"})}},$e=async a=>{if(x()&&a.listStatus!=="administered"){Be(a.rowKey);try{const g=a.date.slice(0,10);if(!F.find(y=>y.animal_id===a.animalId&&(y.treatment_date||"").slice(0,10)===g&&(y.product_name||"").toLowerCase().normalize("NFD").replace(new RegExp("\\p{M}","gu"),"").trim()===a.vaccineName.toLowerCase().normalize("NFD").replace(new RegExp("\\p{M}","gu"),"").trim())){const y=hs({doseLabel:a.doseLabel,plannedReminders:[],userNotes:s("antiparasites.markDoneNote")});await v.mutateAsync({animal_id:a.animalId,product_name:a.vaccineName,parasite_type:a.vaccineType,treatment_date:g,notes:y})}await xs({appointments:$,animalId:a.animalId,productName:a.vaccineName,date:g,kind:"antiparasitic",primaryAppointmentId:a.appointmentId,updateFn:(y,U)=>k.mutateAsync({id:y,data:U})}),W.invalidateQueries({queryKey:["antiparasitics"]}),W.invalidateQueries({queryKey:He.lists()}),a.animalId&&W.invalidateQueries({queryKey:He.byAnimal(a.animalId)}),M({title:s("antiparasites.treatmentAdministeredTitle"),description:s("antiparasites.treatmentAdministeredBody")}),se(!1),Ne(null)}catch(g){M({title:s("antiparasites.cannotMarkDone"),description:(g==null?void 0:g.message)||s("antiparasites.cannotMarkDoneBody"),variant:"destructive"})}finally{Be(null)}}},wa=()=>{const a=JSON.stringify(te,null,2),g=new Blob([a],{type:"application/json"}),T=URL.createObjectURL(g),y=document.createElement("a");y.href=T,y.download=`antiparasites-${ee(new Date,"yyyy-MM-dd")}.json`,y.click(),URL.revokeObjectURL(T)},Ca=[...new Set(I.map(a=>a.vaccineType).filter(Boolean))];return P||l||o||O?e.jsxs("div",{className:"flex items-center justify-center h-64",children:[e.jsx(G,{className:"h-8 w-8 animate-spin"}),e.jsx("span",{className:"ml-2",children:s("antiparasites.loading")})]}):e.jsxs("div",{className:"space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8",children:[e.jsx(Qa,{icon:Xe,title:s("antiparasites.title"),description:s("antiparasites.description"),actions:e.jsxs(e.Fragment,{children:[r&&e.jsxs(f,{onClick:()=>{x()&&pe(!0)},variant:"outline",size:"sm",className:"gap-1 sm:gap-2 rounded-full px-2.5 sm:px-3","aria-label":s("antiparasites.tabs.protocols"),children:[e.jsx(ve,{className:"h-4 w-4"}),e.jsx("span",{className:"hidden sm:inline",children:s("antiparasites.tabs.protocols")})]}),r&&e.jsxs(f,{onClick:()=>{x()&&qe(!0)},size:"sm",className:"gap-1 sm:gap-2 rounded-full",children:[e.jsx(Ze,{className:"h-4 w-4"}),e.jsx("span",{className:"text-xs sm:text-sm",children:s("antiparasites.new")})]})]})}),e.jsxs("div",{className:"app-kpi-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4",children:[e.jsx(R,{children:e.jsx(_,{className:"p-4",children:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-gray-600",children:s("antiparasites.kpi.total")}),e.jsx("p",{className:"text-2xl font-bold",children:S.total})]}),e.jsx(Ge,{className:"h-8 w-8 text-blue-500"})]})})}),e.jsx(R,{children:e.jsx(_,{className:"p-4",children:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-gray-600",children:s("antiparasites.kpi.administered")}),e.jsx("p",{className:"text-2xl font-bold text-green-600",children:S.administered})]}),e.jsx(re,{className:"h-8 w-8 text-green-500"})]})})}),e.jsx(R,{children:e.jsx(_,{className:"p-4",children:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-gray-600",children:s("antiparasites.kpi.overdue")}),e.jsx("p",{className:"text-2xl font-bold text-red-600",children:S.overdue})]}),e.jsx(ma,{className:"h-8 w-8 text-red-500"})]})})}),e.jsx(R,{children:e.jsx(_,{className:"p-4",children:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-gray-600",children:s("antiparasites.kpi.next30")}),e.jsx("p",{className:"text-2xl font-bold text-orange-600",children:S.upcoming})]}),e.jsx(ea,{className:"h-8 w-8 text-orange-500"})]})})}),e.jsx(R,{children:e.jsx(_,{className:"p-4",children:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-gray-600",children:s("antiparasites.kpi.planned")}),e.jsx("p",{className:"text-2xl font-bold text-blue-600",children:S.planned})]}),e.jsx(Ie,{className:"h-8 w-8 text-blue-500"})]})})})]}),e.jsx(R,{children:e.jsx(_,{className:"p-4",children:e.jsxs("div",{className:"flex flex-col gap-4",children:[e.jsxs("div",{className:"relative",children:[e.jsx(ss,{className:"absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"}),e.jsx(Y,{placeholder:s("antiparasites.searchPlaceholder"),value:w,onChange:a=>H(a.target.value),className:"pl-10"})]}),e.jsxs("div",{className:"flex flex-col sm:flex-row gap-4",children:[e.jsxs(le,{value:i,onValueChange:z,children:[e.jsx(ce,{className:"w-full sm:w-48",children:e.jsx(oe,{placeholder:s("antiparasites.filterStatus")})}),e.jsxs(de,{children:[e.jsx(b,{value:"all",children:s("antiparasites.filters.allStatuses")}),e.jsx(b,{value:"administered",children:s("antiparasites.status.administered")}),e.jsx(b,{value:"planned",children:s("antiparasites.status.planned")}),e.jsx(b,{value:"overdue",children:s("antiparasites.status.overdue")})]})]}),e.jsxs(le,{value:B,onValueChange:E,children:[e.jsx(ce,{className:"w-full sm:w-48",children:e.jsx(oe,{placeholder:s("antiparasites.filterParasite")})}),e.jsxs(de,{children:[e.jsx(b,{value:"all",children:s("antiparasites.filters.allParasites")}),Ca.map(a=>e.jsx(b,{value:a,children:a},a))]})]}),e.jsxs(le,{value:K,onValueChange:ye,children:[e.jsx(ce,{className:"w-full sm:w-48",children:e.jsx(oe,{placeholder:s("antiparasites.filterSpecies")})}),e.jsxs(de,{children:[e.jsx(b,{value:"all",children:s("antiparasites.filters.allSpecies")}),c.map(a=>e.jsx(b,{value:a,children:a},a))]})]})]}),e.jsx(Ja,{value:p,onChange:xa,idPrefix:"antiparasites-date",compact:!0})]})})}),e.jsxs(Pa,{defaultValue:"overview",className:"space-y-4",children:[e.jsxs(Ia,{className:"flex flex-wrap",children:[e.jsxs(De,{value:"overview",className:"flex items-center gap-2 flex-1 sm:flex-none",children:[e.jsx(ts,{className:"h-4 w-4"}),s("antiparasites.tabs.overview")]}),e.jsxs(De,{value:"protocols",className:"flex items-center gap-2 flex-1 sm:flex-none",children:[e.jsx(ve,{className:"h-4 w-4"}),s("antiparasites.tabs.protocols")]}),e.jsxs(De,{value:"statistics",className:"flex items-center gap-2 flex-1 sm:flex-none",children:[e.jsx(aa,{className:"h-4 w-4"}),s("antiparasites.statistics.title")]})]}),e.jsx(ke,{value:"overview",children:e.jsxs(R,{children:[e.jsx(ue,{children:e.jsxs(fe,{className:"flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2",children:[e.jsxs("span",{children:[s("antiparasites.title")," (",te.length,")"]}),e.jsxs(f,{variant:"outline",size:"sm",onClick:wa,children:[e.jsx(is,{className:"h-4 w-4 mr-1"}),s("antiparasites.export")]})]})}),e.jsx(_,{children:te.length===0?e.jsxs("div",{className:"text-center py-8 text-gray-500",children:[e.jsx(Xe,{className:"h-12 w-12 mx-auto mb-4 text-gray-300"}),e.jsx("p",{children:s("antiparasites.empty")})]}):D==="table"?e.jsx("div",{className:"overflow-x-auto",children:e.jsxs(_a,{children:[e.jsx(La,{children:e.jsxs(Ke,{children:[e.jsx(X,{children:s("antiparasites.columns.pet")}),e.jsx(X,{children:s("antiparasites.columns.product")}),e.jsx(X,{children:s("antiparasites.treatmentDetails.dosage")}),e.jsx(X,{children:s("antiparasites.columns.date")}),e.jsx(X,{children:s("antiparasites.columns.status")}),e.jsx(X,{children:s("antiparasites.columns.actions")})]})}),e.jsx(Fa,{children:te.map(a=>e.jsxs(Ke,{children:[e.jsx(Z,{children:e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(Ve,{className:"h-8 w-8",children:e.jsx(We,{children:e.jsx(sa,{className:"h-4 w-4"})})}),e.jsxs("div",{children:[e.jsx("div",{className:"font-medium",children:a.petName}),e.jsx("div",{className:"text-sm text-gray-500",children:a.clientName})]})]})}),e.jsxs(Z,{children:[e.jsx("div",{className:"font-medium",children:a.vaccineName}),a.vaccineType&&e.jsx(ne,{variant:"outline",className:"text-xs mt-1",children:a.vaccineType})]}),e.jsx(Z,{children:a.doseLabel}),e.jsx(Z,{children:ee(ge(a.date),"dd/MM/yyyy",{locale:t})}),e.jsx(Z,{children:e.jsx(ne,{className:Te(a.listStatus),children:e.jsxs("div",{className:"flex items-center gap-1",children:[Re(a.listStatus),n(a.listStatus)]})})}),e.jsx(Z,{children:e.jsxs("div",{className:"flex items-center gap-1",children:[e.jsx(f,{variant:"ghost",size:"sm",onClick:()=>{Ne(a),se(!0)},children:e.jsx(ta,{className:"h-4 w-4"})}),r&&a.listStatus!=="administered"&&e.jsx(f,{variant:"ghost",size:"sm",disabled:J===a.rowKey,onClick:()=>$e(a),title:s("antiparasites.markDone"),children:J===a.rowKey?e.jsx(G,{className:"h-4 w-4 animate-spin"}):e.jsx(re,{className:"h-4 w-4 text-green-600"})}),r&&a.treatmentRecord&&e.jsxs(e.Fragment,{children:[e.jsx(f,{variant:"ghost",size:"sm",onClick:()=>Se(a.treatmentRecord),title:s("antiparasites.editTitle"),children:e.jsx(je,{className:"h-4 w-4"})}),e.jsx(f,{variant:"ghost",size:"sm",onClick:()=>Ee(a.treatmentRecord),children:e.jsx(ia,{className:"h-4 w-4"})})]})]})})]},a.rowKey))})]})}):e.jsx("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",children:te.map(a=>e.jsx(R,{className:"hover:shadow-md transition-shadow",children:e.jsxs(_,{className:"p-4",children:[e.jsxs("div",{className:"flex items-center justify-between mb-3",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(Ve,{className:"h-8 w-8",children:e.jsx(We,{children:e.jsx(sa,{className:"h-4 w-4"})})}),e.jsxs("div",{children:[e.jsx("h4",{className:"font-medium text-sm",children:a.petName}),e.jsxs("p",{className:"text-xs text-gray-600",children:[a.species," • ",a.clientName]})]})]}),e.jsx(ne,{className:Te(a.listStatus),children:e.jsxs("div",{className:"flex items-center gap-1",children:[Re(a.listStatus),n(a.listStatus)]})})]}),e.jsxs("div",{className:"space-y-2 text-sm",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(Ge,{className:"h-4 w-4 text-blue-600"}),e.jsx("span",{className:"font-medium",children:a.vaccineName})]}),e.jsxs("div",{className:"flex items-center gap-2 text-gray-600",children:[e.jsx(ns,{className:"h-4 w-4"}),e.jsx("span",{children:a.doseLabel})]}),a.vaccineType&&e.jsxs("div",{children:[e.jsxs("span",{className:"font-medium",children:[s("antiparasites.parasiteLabel"),":"]})," ",a.vaccineType]}),e.jsxs("div",{className:"flex items-center gap-2 text-gray-600",children:[e.jsx(ea,{className:"h-4 w-4"}),e.jsx("span",{children:ee(ge(a.date),"dd/MM/yyyy",{locale:t})})]}),a.administeredBy&&e.jsxs("div",{className:"flex items-center gap-2 text-gray-600",children:[e.jsx(rs,{className:"h-4 w-4"}),e.jsx("span",{children:a.administeredBy})]})]}),e.jsxs("div",{className:"flex justify-between mt-4 gap-2",children:[e.jsxs(f,{variant:"outline",size:"sm",className:"flex-1",onClick:()=>{Ne(a),se(!0)},children:[e.jsx(ta,{className:"h-4 w-4 mr-1"}),d("details")]}),r&&a.listStatus!=="administered"&&e.jsx(f,{size:"sm",disabled:J===a.rowKey,onClick:()=>$e(a),title:s("antiparasites.markDone"),children:J===a.rowKey?e.jsx(G,{className:"h-4 w-4 animate-spin"}):e.jsx(re,{className:"h-4 w-4"})}),r&&a.treatmentRecord&&e.jsxs(e.Fragment,{children:[e.jsx(f,{variant:"outline",size:"sm",onClick:()=>Se(a.treatmentRecord),title:s("antiparasites.editTitle"),children:e.jsx(je,{className:"h-4 w-4"})}),e.jsx(f,{variant:"ghost",size:"sm",onClick:()=>Ee(a.treatmentRecord),children:e.jsx(ia,{className:"h-4 w-4"})})]})]})]})},a.rowKey))})})]})}),e.jsx(ke,{value:"protocols",children:e.jsxs(R,{children:[e.jsx(ue,{children:e.jsxs(fe,{className:"flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2",children:[e.jsxs("span",{children:[s("antiparasites.protocolsTitle")," (",V.length,")"]}),r&&e.jsxs(f,{onClick:()=>{x()&&(ze(null),pe(!0))},className:"gap-2 w-full sm:w-auto",children:[e.jsx(Ze,{className:"h-4 w-4"}),s("antiparasites.createProtocol")]})]})}),e.jsxs(_,{children:[Q?e.jsx("div",{className:"text-center py-8",children:e.jsx(G,{className:"h-8 w-8 animate-spin mx-auto"})}):e.jsx("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",children:V.map(a=>e.jsx(R,{className:"hover:shadow-md transition-shadow",children:e.jsxs(_,{className:"p-4",children:[e.jsxs("div",{className:"flex items-center justify-between mb-3",children:[e.jsx(ne,{variant:"outline",children:a.species}),r&&e.jsx(f,{variant:"ghost",size:"sm",onClick:()=>{x()&&(ze(a),pe(!0))},children:e.jsx(je,{className:"h-4 w-4"})})]}),e.jsx("h4",{className:"font-medium mb-2",children:a.product_name}),e.jsxs("div",{className:"space-y-1 text-sm text-gray-600",children:[e.jsxs("div",{children:[e.jsxs("span",{className:"font-medium",children:[s("antiparasites.parasiteLabel"),":"]})," ",a.parasite_type]}),a.active_ingredient&&e.jsxs("div",{children:[e.jsxs("span",{className:"font-medium",children:[s("antiparasites.treatmentDetails.activeIngredient"),":"]})," ",a.active_ingredient]}),a.frequency&&e.jsx("div",{children:s("antiparasites.protocolMeta.frequency",{frequency:a.frequency})})]})]})},a.id))}),V.length===0&&!Q&&e.jsxs("div",{className:"text-center py-8 text-gray-500",children:[e.jsx(ve,{className:"h-12 w-12 mx-auto mb-4 text-gray-300"}),e.jsx("p",{children:s("antiparasites.emptyProtocols")})]})]})]})}),e.jsx(ke,{value:"statistics",children:e.jsxs("div",{className:"grid grid-cols-1 lg:grid-cols-2 gap-6",children:[e.jsxs(R,{children:[e.jsx(ue,{children:e.jsxs(fe,{className:"flex items-center gap-2",children:[e.jsx(aa,{className:"h-5 w-5"}),s("antiparasites.statistics.byParasite")]})}),e.jsx(_,{children:e.jsxs("div",{className:"space-y-3",children:[Object.entries(S.parasiteTypes).map(([a,g])=>e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("span",{className:"text-sm",children:a}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("div",{className:"bg-gray-200 rounded-full h-2 w-20",children:e.jsx("div",{className:"bg-blue-500 h-2 rounded-full",style:{width:`${S.total?g/S.total*100:0}%`}})}),e.jsx("span",{className:"text-sm font-medium",children:g})]})]},a)),Object.keys(S.parasiteTypes).length===0&&e.jsx("p",{className:"text-sm text-muted-foreground",children:d("noData")})]})})]}),e.jsxs(R,{children:[e.jsx(ue,{children:e.jsx(fe,{children:s("antiparasites.statistics.doseSummary")})}),e.jsx(_,{children:e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsx("span",{children:s("antiparasites.kpi.total")}),e.jsx("span",{className:"font-bold",children:S.total})]}),e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsx("span",{children:s("antiparasites.kpi.administered")}),e.jsx("span",{className:"font-bold text-green-600",children:S.administered})]}),e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsx("span",{children:s("antiparasites.kpi.planned")}),e.jsx("span",{className:"font-bold text-blue-600",children:S.planned})]}),e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsx("span",{children:s("antiparasites.kpi.overdue")}),e.jsx("span",{className:"font-bold text-red-600",children:S.overdue})]}),e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsx("span",{children:s("antiparasites.kpi.next30")}),e.jsx("span",{className:"font-bold text-orange-600",children:S.upcoming})]})]})})]})]})})]}),e.jsx(Ye,{open:ua,onOpenChange:qe}),e.jsx(Ye,{open:Na,onOpenChange:a=>{Ce(a),a||we(null)},editingAntiparasitic:ya,onUpdated:()=>{we(null),Ce(!1)}}),e.jsx(js,{open:fa,onOpenChange:pe,editingProtocol:va}),e.jsx(_e,{open:ja,onOpenChange:se,children:e.jsxs(Le,{className:"max-w-2xl",children:[e.jsx(Fe,{children:e.jsx(Pe,{children:s("antiparasites.treatmentDetails.title")})}),u&&e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-4",children:[e.jsxs("div",{children:[e.jsxs("p",{className:"font-medium",children:[s("antiparasites.columns.pet"),":"]}),e.jsx("p",{children:u.petName})]}),e.jsxs("div",{children:[e.jsxs("p",{className:"font-medium",children:[s("antiparasites.columns.client"),":"]}),e.jsx("p",{children:u.clientName})]}),e.jsxs("div",{children:[e.jsxs("p",{className:"font-medium",children:[s("antiparasites.treatmentDetails.product"),":"]}),e.jsx("p",{children:u.vaccineName})]}),e.jsxs("div",{children:[e.jsxs("p",{className:"font-medium",children:[s("antiparasites.treatmentDetails.dosage"),":"]}),e.jsx("p",{children:u.doseLabel})]}),e.jsxs("div",{children:[e.jsxs("p",{className:"font-medium",children:[s("antiparasites.treatmentDetails.date"),":"]}),e.jsx("p",{children:ee(ge(u.date),"dd/MM/yyyy",{locale:t})})]}),e.jsxs("div",{children:[e.jsxs("p",{className:"font-medium",children:[s("antiparasites.columns.status"),":"]}),e.jsx(ne,{className:Te(u.listStatus),children:e.jsxs("div",{className:"flex items-center gap-1",children:[Re(u.listStatus),n(u.listStatus)]})})]}),u.vaccineType&&e.jsxs("div",{children:[e.jsxs("p",{className:"font-medium",children:[s("antiparasites.parasiteLabel"),":"]}),e.jsx("p",{children:u.vaccineType})]}),u.administeredBy&&e.jsxs("div",{children:[e.jsxs("p",{className:"font-medium",children:[s("antiparasites.status.administered"),":"]}),e.jsx("p",{children:u.administeredBy})]})]}),u.notes&&e.jsxs("div",{children:[e.jsxs("p",{className:"font-medium",children:[s("antiparasites.treatmentDetails.notes"),":"]}),e.jsx("p",{className:"text-gray-600",children:u.notes})]}),e.jsxs("div",{className:"border-t pt-4 flex flex-wrap gap-2 justify-center",children:[r&&u.listStatus!=="administered"&&e.jsxs(f,{disabled:J===u.rowKey,onClick:()=>$e(u),children:[J===u.rowKey?e.jsx(G,{className:"h-4 w-4 mr-2 animate-spin"}):e.jsx(re,{className:"h-4 w-4 mr-2"}),s("antiparasites.markDone")]}),r&&u.treatmentRecord&&e.jsxs(f,{variant:"outline",onClick:()=>Se(u.treatmentRecord),children:[e.jsx(je,{className:"h-4 w-4 mr-2"}),d("edit")]}),e.jsx(gs,{animalId:u.animalId})]})]})]})}),e.jsx(_e,{open:ga,onOpenChange:he,children:e.jsxs(Le,{className:"max-w-md",children:[e.jsx(Fe,{children:e.jsx(Pe,{children:s("antiparasites.deleteConfirmTitle")})}),be&&e.jsxs("div",{className:"space-y-4",children:[e.jsx("p",{className:"text-gray-600",children:s("antiparasites.deleteConfirmBody")}),e.jsx("p",{className:"text-sm text-red-600",children:d("cannotUndo")}),e.jsxs("div",{className:"flex flex-col sm:flex-row justify-end gap-2",children:[e.jsx(f,{variant:"outline",onClick:()=>he(!1),className:"w-full sm:w-auto",children:d("cancel")}),e.jsx(f,{variant:"destructive",onClick:ba,className:"w-full sm:w-auto",children:s("antiparasites.deleteConfirmAction")})]})]})]})})]})}export{st as default};
