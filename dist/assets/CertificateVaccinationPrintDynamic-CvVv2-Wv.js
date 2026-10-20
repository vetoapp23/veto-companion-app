import{r as b,j as s}from"./vendor-react-Cg95Wd9j.js";import{O as V,P as E,l as Y,B as N,V as C,W as B}from"./index-CfItjhrY.js";import{C as H}from"./checkbox-CUKavNMH.js";import{a as L,u as R,c as W,n as O}from"./useDatabase-DjoDdym8.js";import{w as U,b as I}from"./printWatermark-BmQ03DH8.js";import{q as Q}from"./medicalShare-Bl2RUBkT.js";import{g as G,f as J}from"./reminderAppointments-KDrlEC7O.js";import{u as K}from"./vendor-i18n-02tLOPTM.js";import{ar as P}from"./vendor-icons-B9J2mvrK.js";import{f as X}from"./format-COjnugwY.js";function rt({animalId:h}){const{settings:o}=V(),{t}=K("medical"),{dateFns:D}=E(),{isFree:_}=Y(),{data:v}=L(),{data:x}=R(),{data:u}=W(),{data:y=[]}=O(h),[k,z]=b.useState(!0),[T,$]=b.useState(!1),A=(o.veterinarians||[]).filter(n=>n.isActive!==!1),i=v==null?void 0:v.find(n=>n.id===h),l=i?x==null?void 0:x.find(n=>n.id===i.client_id):null,j=b.useMemo(()=>(u==null?void 0:u.filter(n=>n.animal_id===h))||[],[u,h]),r=b.useMemo(()=>G(j,y),[j,y]),q=n=>{const c=new Date(n),d=new Date;if(isNaN(c.getTime()))return"N/A";let m=d.getFullYear()-c.getFullYear(),a=d.getMonth()-c.getMonth(),p=d.getDate()-c.getDate();if(p<0){a--;const w=new Date(d.getFullYear(),d.getMonth(),0);p+=w.getDate()}a<0&&(m--,a+=12);const g=Math.floor(p/7),f=[];return m>0&&f.push(t("vaccinationCertificate.ageYears",{count:m})),a>0&&f.push(t("vaccinationCertificate.ageMonths",{count:a})),g>0&&f.push(t("vaccinationCertificate.ageWeeks",{count:g})),f.join(", ")||t("vaccinationCertificate.ageDays",{count:0})},M=async()=>{if(!i||!l){alert(t("alerts.missingAnimalClient"));return}$(!0);const n=window.open("",`vaccination_certificate_${i.id}`,"height=900,width=820");if(!n){$(!1),alert(t("alerts.printBlocked"));return}try{n.document.open(),n.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${C(t("vaccinationCertificate.heading"))}</title></head><body style="font-family:Arial,sans-serif;padding:24px;color:#555;">${C(t("alerts.printPreparing",{defaultValue:"Preparing…"}))}</body></html>`),n.document.close();const c=X(new Date,"PPp",{locale:D}),d=[t("vaccinationCertificate.heading"),`${o.clinicName||t("vaccinationCertificate.clinicFallback")}`,`${i.name} · ${i.species}${i.breed?` · ${i.breed}`:""}`,i.microchip_number||i.chip_number?`Chip: ${i.microchip_number||i.chip_number}`:null,`${l.first_name} ${l.last_name}`,o.phone||o.email||o.website||"",c].filter(Boolean).join(`
`),m=await Q(d,160),a=C,p=B,g=r.filter(e=>e.status==="administered").length,f=r.filter(e=>e.status==="planned").length,w=r.length>0?`
            <table class="doses-table">
              <thead>
                <tr>
                  <th>${t("vaccinationCertificate.cols.date")}</th>
                  <th>${t("vaccinationCertificate.cols.vaccine")}</th>
                  <th>${t("vaccinationCertificate.cols.dose")}</th>
                  <th>${t("vaccinationCertificate.cols.status")}</th>
                  <th>${t("vaccinationCertificate.cols.batch")}</th>
                  <th>${t("vaccinationCertificate.cols.manufacturer")}</th>
                </tr>
              </thead>
              <tbody>
                ${r.map(e=>`
                  <tr class="${e.status==="planned"?"row-planned":"row-done"}">
                    <td>${a(J(e.date))}</td>
                    <td>
                      <strong>${a(e.vaccineName)}</strong>
                      ${e.vaccineType?`<div class="muted">${a(e.vaccineType)}</div>`:""}
                    </td>
                    <td>${a(e.doseLabel)}</td>
                    <td>
                      <span class="badge ${e.status==="planned"?"badge-planned":"badge-done"}">
                        ${e.status==="planned"?a(t("vaccinationCertificate.statusPlanned")):a(t("vaccinationCertificate.statusDone"))}
                      </span>
                    </td>
                    <td>${a(e.batchNumber||(e.status==="planned"?"—":"N/A"))}</td>
                    <td>${a(e.manufacturer||(e.status==="planned"?"—":"N/A"))}</td>
                  </tr>
                  ${e.notes?`<tr class="notes-row"><td colspan="6"><em>${a(t("vaccinationCertificate.notes"))}</em> ${a(e.notes)}</td></tr>`:""}
                `).join("")}
              </tbody>
            </table>
            <p class="doses-summary">
              ${t("vaccinationCertificate.summary",{done:g})}${f>0?t("vaccinationCertificate.summaryPlanned",{planned:f}):""}
            </p>
          `:`<div class="no-vaccinations">
              <p>${t("vaccinationCertificate.empty")}</p>
            </div>`,F=`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <title>${a(t("vaccinationCertificate.docTitle",{name:i.name}))}</title>
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
                min-width: 520px;
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
              ${U}
            </style>
          </head>
          <body>
            ${I(_)}
            <div class="header">
              <div class="header-main">
                ${o.logo?`<img src="${p(o.logo)}" alt="${a(t("vaccinationCertificate.clinicLogoAlt"))}" />`:""}
                <h1>${a(t("vaccinationCertificate.heading"))}</h1>
              </div>
              <div class="qr-section">
                <img src="${p(m)}" width="100" height="100" alt="QR" />
                <div class="qr-caption">${a(t("vaccinationCertificate.qrCaption",{defaultValue:"Scan"}))}</div>
              </div>
            </div>

            ${o.showClinicInfo?`
            <div class="clinic-info">
              <h2>${a(o.clinicName||t("vaccinationCertificate.clinicFallback"))}</h2>
              <p><strong>${a(t("vaccinationCertificate.labels.address"))}</strong> ${a(o.address||"N/A")}</p>
              <p><strong>${a(t("vaccinationCertificate.labels.phone"))}</strong> ${a(o.phone||"N/A")} | <strong>${a(t("vaccinationCertificate.labels.email"))}</strong> ${a(o.email||"N/A")}</p>
              ${o.website?`<p><strong>${a(t("vaccinationCertificate.labels.website"))}</strong> ${a(o.website)}</p>`:""}
            </div>
            `:""}

            ${o.showVetsInfo&&A.length>0?`
            <div class="vets-info">
              <h2>${t("vaccinationCertificate.vetTeam")}</h2>
              ${A.map(e=>`
                <div class="vet-item">
                  <strong>${a(e.title||"Dr.")} ${a(e.name)}</strong>
                  ${e.specialty?` - ${a(e.specialty)}`:""}
                </div>
              `).join("")}
            </div>
            `:""}

            <div class="animal-info">
              <h2>${t("vaccinationCertificate.animalInfo")}</h2>
              ${k&&i.photo_url?`
              <div class="animal-photo">
                <img src="${p(i.photo_url)}" alt="${a(t("vaccinationCertificate.animalPhotoAlt",{name:i.name}))}" />
              </div>
              `:""}
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">${t("vaccinationCertificate.labels.name")}</span>
                  <span class="info-value">${a(i.name)}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">${a(t("vaccinationCertificate.labels.species"))}</span>
                  <span class="info-value">${a(i.species)}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">${a(t("vaccinationCertificate.labels.breed"))}</span>
                  <span class="info-value">${a(i.breed||"N/A")}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">${a(t("vaccinationCertificate.labels.age"))}</span>
                  <span class="info-value">${a(i.birth_date?q(i.birth_date):"N/A")}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">${a(t("vaccinationCertificate.labels.sex"))}</span>
                  <span class="info-value">${a(i.sex||"N/A")}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">${a(t("vaccinationCertificate.labels.weight"))}</span>
                  <span class="info-value">${a(i.weight?i.weight+" kg":"N/A")}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">${a(t("vaccinationCertificate.labels.owner"))}</span>
                  <span class="info-value">${a(l.first_name)} ${a(l.last_name)}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">${a(t("vaccinationCertificate.labels.contact"))}</span>
                  <span class="info-value">${a(l.phone||l.email||"N/A")}</span>
                </div>
              </div>
            </div>

            <div class="vaccinations-section">
              <h2>${t("vaccinationCertificate.scheduleTitle")}</h2>
              <div class="table-wrap">${w}</div>
            </div>

            <div class="footer">
              <p>${a(t("vaccinationCertificate.generatedAt",{datetime:c}))}</p>
              <p>${a(t("vaccinationCertificate.footerSystem"))}</p>
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
      `;n.document.open(),n.document.write(F),n.document.close()}catch(c){console.error("Erreur lors de l'impression:",c);try{n.close()}catch{}alert(t("alerts.printError"))}finally{$(!1)}};if(!i||!l)return s.jsxs(N,{variant:"outline",disabled:!0,size:"sm",className:"w-full sm:w-auto justify-center",children:[s.jsx(P,{className:"h-4 w-4 mr-2 shrink-0"}),s.jsx("span",{className:"sm:hidden",children:t("vaccinationCertificate.buttonShort")}),s.jsx("span",{className:"hidden sm:inline",children:t("vaccinationCertificate.button")})]});const S=!!i.photo_url;return s.jsxs("div",{className:"flex flex-col gap-2 w-full sm:w-auto",children:[S&&s.jsxs("label",{className:"flex items-center gap-2 text-xs sm:text-sm cursor-pointer",children:[s.jsx(H,{checked:k,onCheckedChange:n=>z(n===!0)}),s.jsx("span",{children:t("vaccinationCertificate.includeAnimalPhoto")})]}),s.jsxs(N,{variant:"outline",size:"sm",className:"w-full sm:w-auto justify-center",onClick:()=>void M(),disabled:T,children:[s.jsx(P,{className:"h-4 w-4 mr-2 shrink-0"}),s.jsxs("span",{className:"sm:hidden",children:[t("vaccinationCertificate.buttonShort"),r.length>0?` (${r.length})`:""]}),s.jsxs("span",{className:"hidden sm:inline",children:[t("vaccinationCertificate.button"),r.length>0?` (${r.length})`:""]})]})]})}export{rt as C};
