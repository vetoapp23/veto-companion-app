import{j as l}from"./vendor-react-Cg95Wd9j.js";import{O as h,l as x,B as w,Z as y,R as r,V as N}from"./index-CfItjhrY.js";import{w as b,b as S}from"./printWatermark-BmQ03DH8.js";import{u as m}from"./vendor-i18n-02tLOPTM.js";import{ar as P}from"./vendor-icons-B9J2mvrK.js";function k({consultation:p}){const{settings:c}=h(),{isFree:d}=x(),{t:n,i18n:a}=m("medical"),{t:s}=m("common"),e=(i=>{var o;return i.petName&&i.clientName?i:{...i,petName:((o=i.animal)==null?void 0:o.name)||s("notSpecified"),clientName:i.client?`${i.client.first_name||""} ${i.client.last_name||""}`.trim():s("notSpecified"),date:i.consultation_date||i.date,symptoms:i.symptoms||"",diagnosis:i.diagnosis||"",treatment:i.treatment||"",notes:i.notes||"",weight:i.weight||null,temperature:y(i.temperature)??null,medications:i.medications||"",followUp:i.follow_up_notes||i.followUp||null,cost:i.cost||null}})(p),f=()=>{if(!e||!e.petName||!e.clientName)return;const i=window.open("","_blank");if(!i)return;const o=n("print.consultation.notProvided"),t=N,g=t(e.petName),u=t(e.clientName),v=t(c.clinicName||"VetoCrm"),$=`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${t(n("print.consultation.docTitle",{name:e.petName}))}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              line-height: 1.6;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .clinic-name {
              font-size: 24px;
              font-weight: bold;
              color: #2563eb;
            }
            .consultation-title {
              font-size: 20px;
              margin: 10px 0;
            }
            .info-grid {
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
            .info-section h3 {
              margin: 0 0 10px 0;
              color: #333;
              border-bottom: 1px solid #eee;
              padding-bottom: 5px;
            }
            .info-item {
              margin: 5px 0;
            }
            .info-label {
              font-weight: bold;
              color: #666;
            }
            .medical-section {
              margin: 20px 0;
            }
            .medical-section h3 {
              color: #333;
              border-bottom: 1px solid #eee;
              padding-bottom: 5px;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              font-size: 12px;
              color: #666;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
            ${b}
          </style>
        </head>
        <body>
          ${S(d)}
          <div class="header">
            <div class="clinic-name">${v}</div>
            <div class="consultation-title">${t(n("print.consultation.reportTitle"))}</div>
            <div>${t(n("print.consultation.date"))} ${t(new Date(e.date).toLocaleDateString(r(a.language)))}</div>
          </div>

          <div class="info-grid">
            <div class="info-section">
              <h3>${t(n("print.consultation.clientInfo"))}</h3>
              <div class="info-item">
                <span class="info-label">${t(n("print.consultation.name"))}</span> ${u}
              </div>
            </div>
            <div class="info-section">
              <h3>${t(n("print.consultation.animalInfo"))}</h3>
              <div class="info-item">
                <span class="info-label">${t(n("print.consultation.name"))}</span> ${g}
              </div>
              <div class="info-item">
                <span class="info-label">${t(n("print.consultation.weight"))}:</span> ${t(e.weight||o)}
              </div>
              <div class="info-item">
                <span class="info-label">${t(n("print.consultation.temperature"))}:</span> ${e.temperature?t(e.temperature+"°C"):t(o)}
              </div>
            </div>
          </div>

          ${e.symptoms?`
            <div class="medical-section">
              <h3>${t(n("print.consultation.symptomsObserved"))}</h3>
              <p>${t(e.symptoms)}</p>
            </div>
          `:""}

          ${e.diagnosis?`
            <div class="medical-section">
              <h3>${t(n("print.consultation.diagnosis"))}</h3>
              <p>${t(e.diagnosis)}</p>
            </div>
          `:""}

          ${e.treatment?`
            <div class="medical-section">
              <h3>${t(n("print.consultation.treatmentAdministered"))}</h3>
              <p>${t(e.treatment)}</p>
            </div>
          `:""}

          ${e.medications?`
            <div class="medical-section">
              <h3>${t(n("print.consultation.medicationsPrescribed"))}</h3>
              <p>${t(e.medications)}</p>
            </div>
          `:""}

          ${e.notes?`
            <div class="medical-section">
              <h3>${t(n("print.consultation.additionalNotes"))}</h3>
              <p>${t(e.notes)}</p>
            </div>
          `:""}

          <div class="info-grid">
            <div class="info-section">
              <h3>${t(n("print.consultation.followUpRecommended"))}</h3>
              <p>${t(e.followUp||n("print.consultation.noFollowUp"))}</p>
            </div>
            <div class="info-section">
              <h3>${t(n("print.consultation.costShort"))}</h3>
              <p>${e.cost?t(String(e.cost)+" "+(c.currency||"MAD")):t(o)}</p>
            </div>
          </div>

          <div class="footer">
            <p>${t(n("print.consultation.consultationGenerated",{date:new Date().toLocaleDateString(r(a.language)),time:new Date().toLocaleTimeString(r(a.language))}))}</p>
            <p>${t(n("print.consultation.footerBrand"))}</p>
          </div>
        </body>
      </html>
    `;i.document.write($),i.document.close(),setTimeout(()=>{i.focus(),i.print(),i.close()},500)};return l.jsxs(w,{size:"sm",variant:"outline",onClick:f,className:"gap-2",children:[l.jsx(P,{className:"h-4 w-4"}),s("print")]})}export{k as C};
