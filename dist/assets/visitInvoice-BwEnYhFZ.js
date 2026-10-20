import{s as d}from"./index-CfItjhrY.js";import{p as q}from"./htmlToPdf-D95Y8rE9.js";import{t as $,s as E,c as F}from"./accountingLedger-DXLfxz20.js";import{i as N}from"./vendor-i18n-02tLOPTM.js";const o=(e,n)=>N.t(e,{ns:"app",...n});function k(){return(N.language||"fr").split("-")[0]||"fr"}function c(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}async function j(){const{data:{user:e}}=await d.auth.getUser();if(!e)throw new Error(o("accounting.print.invoice.errors.unauthenticated"));const{data:n,error:t}=await d.from("user_profiles").select("organization_id").eq("id",e.id).single();if(t||!(n!=null&&n.organization_id))throw new Error(o("accounting.print.invoice.errors.orgNotFound"));return{user:e,organizationId:n.organization_id}}function I(e,n,t){const i=n==="per_head"&&t&&t>0?t:1;return e.filter(a=>a.status==="done"&&Number(a.amount)>0).map((a,s)=>{const l=Number(a.amount)||0;return{label:a.service_label,service_code:a.service_code,quantity:i,unit_price:l,amount:l*i,reference_type:a.reference_type,reference_id:a.reference_id,sort_order:s}})}function S(e){return e.reduce((n,t)=>n+Number(t.amount||0),0)}async function D(e){var p;const t=`FAC-${$().slice(0,7).replace("-","")}-`,{data:i,error:a}=await d.from("invoices").select("invoice_number").eq("organization_id",e).like("invoice_number",`${t}%`).order("invoice_number",{ascending:!1}).limit(1);if(a)throw new Error(a.message);let s=1;const l=(p=i==null?void 0:i[0])==null?void 0:p.invoice_number;if(l){const m=l.split("-").pop(),g=parseInt(m||"0",10);Number.isNaN(g)||(s=g+1)}return`${t}${String(s).padStart(4,"0")}`}async function B(e){const{user:n,organizationId:t}=await j(),i=e.visit;if(i.invoiced&&i.invoice_id)return z(i.invoice_id);const a=I(e.services,i.billing_mode,i.head_count);if(a.length===0)throw new Error(o("accounting.print.invoice.errors.noBillable"));const s=S(a),l=e.taxRate??0,p=Math.round(s*l*100)/100,m=await D(t),g=$(),w=a.map(r=>`${r.label} ×${r.quantity}: ${r.amount.toFixed(0)}`).join(" · "),{data:f,error:x}=await d.from("invoices").insert({client_id:i.client_id,organization_id:t,user_id:n.id,visit_id:i.id,invoice_number:m,invoice_date:g,total_amount:s,tax_amount:p,status:"issued",notes:e.notes||w}).select("*").single();if(x)throw new Error(x.message);const y=a.map(r=>({invoice_id:f.id,organization_id:t,label:r.label,service_code:r.service_code||null,quantity:r.quantity,unit_price:r.unit_price,amount:r.amount,reference_type:r.reference_type||null,reference_id:r.reference_id||null,sort_order:r.sort_order})),{error:v}=await d.from("invoice_lines").insert(y);if(v)throw new Error(v.message);const _=e.services.filter(r=>r.status==="done"&&Number(r.amount)>0);for(const r of _)await E(r,i);const{data:u}=await d.from("revenue").select("id").eq("organization_id",t).eq("reference_id",i.id).eq("reference_type","visit").maybeSingle();u!=null&&u.id&&await d.from("revenue").delete().eq("id",u.id);const{error:b}=await d.from("visits").update({invoiced:!0,invoice_id:f.id,total_amount:s,updated_at:new Date().toISOString()}).eq("id",i.id);if(b)throw new Error(b.message);return{...f,lines:a}}async function z(e){const{data:n,error:t}=await d.from("invoices").select("*").eq("id",e).single();if(t)throw new Error(t.message);const{data:i}=await d.from("invoice_lines").select("*").eq("invoice_id",e).order("sort_order");return{...n,lines:i||[]}}async function O(e,n){const t=await z(e),{error:i}=await d.from("invoices").update({status:"paid",payment_date:$(),payment_method:n||"cash",updated_at:new Date().toISOString()}).eq("id",e);if(i)throw new Error(i.message);try{await F({invoiceId:e,amount:Number(t.total_amount)||0,paymentMethod:n||"cash",paymentDate:$(),notes:o("accounting.print.invoice.paymentNote",{number:t.invoice_number})})}catch(a){console.warn("Payment row insert failed",a)}return z(e)}function H(e){var v,_,u,b,r;const{invoice:n,visit:t,settings:i}=e,a=i.currency||"MAD",s=i.clinicName||o("accounting.print.invoice.clinicFallback"),l=n.lines||[],p=Number(n.tax_amount||0),m=Number(n.total_amount||0),g=m-p,w=`${((v=t.client)==null?void 0:v.first_name)||""} ${((_=t.client)==null?void 0:_.last_name)||""}`.trim(),f=t.context==="farm"?((u=t.farm)==null?void 0:u.farm_name)||o("accounting.print.invoice.farmFallback"):t.animal?`${t.animal.name}${t.animal.species?` (${t.animal.species})`:""}`:"—",x=l.map(h=>`
      <tr>
        <td>${c(h.label)}</td>
        <td style="text-align:center">${Number(h.quantity)}</td>
        <td style="text-align:right">${Number(h.unit_price).toFixed(2)}</td>
        <td style="text-align:right">${Number(h.amount).toFixed(2)}</td>
      </tr>`).join(""),y=i.logo?`<img src="${i.logo}" alt="" style="max-height:64px;max-width:120px;object-fit:contain" />`:"";return`<!DOCTYPE html>
<html lang="${k()}">
<head>
  <meta charset="utf-8" />
  <title>${c(o("accounting.print.invoice.docTitle",{number:n.invoice_number}))}</title>
  <style>
    body { font-family: Georgia, 'Times New Roman', serif; margin: 0; color: #1a1a1a; background: #fff; }
    .report-root { width: 794px; max-width: 794px; padding: 32px 40px; box-sizing: border-box; background: #fff; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f766e; padding-bottom: 16px; margin-bottom: 24px; }
    .clinic h1 { margin: 0 0 6px; font-size: 22px; color: #0f766e; }
    .clinic p { margin: 2px 0; font-size: 12px; color: #555; }
    .meta { text-align: right; font-size: 13px; }
    .meta strong { font-size: 16px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; font-size: 13px; }
    .box h3 { margin: 0 0 8px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.04em; color: #0f766e; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; }
    th { background: #f0fdfa; text-align: left; padding: 10px 8px; border-bottom: 1px solid #99f6e4; }
    td { padding: 10px 8px; border-bottom: 1px solid #e5e7eb; }
    .totals { margin-left: auto; width: 240px; font-size: 13px; }
    .totals .row { display: flex; justify-content: space-between; padding: 4px 0; }
    .totals .grand { font-weight: bold; font-size: 16px; border-top: 2px solid #0f766e; margin-top: 8px; padding-top: 8px; }
    .status { display: inline-block; padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: 600;
      background: ${n.status==="paid"?"#dcfce7":"#fef3c7"}; color: ${n.status==="paid"?"#166534":"#92400e"}; }
    .footer { margin-top: 36px; font-size: 11px; color: #888; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 12px; }
  </style>
</head>
<body>
  <div class="report-root">
    <div class="header">
      <div class="clinic">
        ${y}
        <h1>${c(s)}</h1>
        ${i.address?`<p>${c(i.address)}</p>`:""}
        ${i.phone?`<p>${c(o("accounting.print.invoice.tel",{phone:i.phone}))}</p>`:""}
        ${i.email?`<p>${c(i.email)}</p>`:""}
      </div>
      <div class="meta">
        <strong>${o("accounting.print.invoice.heading")}</strong><br/>
        ${o("accounting.print.invoice.numberPrefix")} ${c(n.invoice_number)}<br/>
        ${o("accounting.print.invoice.date")} ${c(n.invoice_date)}<br/>
        <span class="status">${n.status==="paid"?o("accounting.print.invoice.status.paid"):o("accounting.print.invoice.status.issued")}</span>
      </div>
    </div>
    <div class="grid">
      <div class="box">
        <h3>${o("accounting.print.invoice.client")}</h3>
        <div>${c(w||"—")}</div>
        ${(b=t.client)!=null&&b.phone?`<div>${c(t.client.phone)}</div>`:""}
        ${(r=t.client)!=null&&r.email?`<div>${c(t.client.email)}</div>`:""}
      </div>
      <div class="box">
        <h3>${t.context==="farm"?o("accounting.print.invoice.subject.farm"):o("accounting.print.invoice.subject.animal")}</h3>
        <div>${c(f)}</div>
        ${t.context==="farm"&&t.head_count?`<div>${o("accounting.print.invoice.headCount",{count:t.head_count})}${t.billing_mode==="per_head"?o("accounting.print.invoice.perHead"):o("accounting.print.invoice.flatRate")}</div>`:""}
      </div>
    </div>
    <table>
      <thead>
        <tr>
          <th>${o("accounting.print.invoice.cols.service")}</th>
          <th style="text-align:center">${o("accounting.print.invoice.cols.qty")}</th>
          <th style="text-align:right">${o("accounting.print.invoice.cols.unitPrice",{currency:a})}</th>
          <th style="text-align:right">${o("accounting.print.invoice.cols.amount")}</th>
        </tr>
      </thead>
      <tbody>${x}</tbody>
    </table>
    <div class="totals">
      <div class="row"><span>${o("accounting.print.invoice.subtotal")}</span><span>${g.toFixed(2)} ${c(a)}</span></div>
      ${p>0?`<div class="row"><span>${o("accounting.print.invoice.tax")}</span><span>${p.toFixed(2)} ${c(a)}</span></div>`:""}
      <div class="row grand"><span>${o("accounting.print.invoice.totalTtc")}</span><span>${m.toFixed(2)} ${c(a)}</span></div>
    </div>
    <div class="footer">${c(o("accounting.print.invoice.footer",{clinic:s}))}</div>
  </div>
</body>
</html>`}async function R(e,n,t){const i=H({invoice:e,visit:n,settings:t});await q(i)}export{I as b,B as c,z as g,O as m,R as p,S as s};
