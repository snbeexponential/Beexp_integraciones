/**
 * @author Angel Leon <angel.leon@beexponential.com.mx>
 * @Name DT_sl_reporte_limite_credito.js
 * @description Reporte de Saldos de Limites de Credito para analizar los limites de credito y % de exposicion de cada cliente
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
define(['N/ui/serverWidget','N/search','N/ui/dialog','N/ui/message','N/format', 'N/record','N/url','N/redirect'], 
   function (serverWidget,search,dialog,message,format,record,url,redirect) {
   const entry_point = {
      onRequest: null,
   };

   entry_point.onRequest = function (context) {
      //log.audit('context', context);
      try {
         
         try{var proveedor = context.request.parameters._proveedor;}    catch(ex){var proveedor = undefined;}
         try{var cliente = context.request.parameters._cliente;}        catch(ex){var cliente = undefined;}
         try{var rfcprov = context.request.parameters._rfc_proveedor;}  catch(ex){var rfcprov = undefined;}
         try{var rfcclte = context.request.parameters._rfc_cliente;}    catch(ex){var rfcclte = undefined;}
         try{var total_cxc = context.request.parameters._total_cxc;}    catch(ex){var total_cxc = undefined;}
         try{var total_cxp = context.request.parameters._total_cxp;}    catch(ex){var total_cxp = undefined;}

         var seleccionados = verseleccionados2(context);         

         switch (context.request.method) {
            case 'GET':
               var form = main(proveedor,cliente,rfcprov,rfcclte,total_cxc,total_cxp,seleccionados,context);
               context.response.writePage(form);
               break;
            case 'POST':
               var form = main(proveedor,cliente,rfcprov,rfcclte,total_cxc,total_cxp,seleccionados,context);
               context.response.writePage(form);
               break;
         }
      } catch (error) {
         log.error("error", error);

         var myPageObj = serverWidget.createForm({
            title: "Mensaje: " + error.message
         });

         context.response.writePage({
            pageObject: myPageObj
         });
      }
   }

   return entry_point;


   function main(proveedor,cliente,rfcprov,rfcclte,total_cxc,total_cxp,seleccionadoss,context)
   {  
      var form = serverWidget.createForm({ title: 'Compensación de Facturas' });
      form.clientScriptModulePath = './client_compensa.js';

      try
      {  

         if(proveedor == undefined || proveedor == "")
         {
            var form = createForms(form,0); 
         }
         else
         {  

            var form = createForms(form,1);
            var form = validactas(form,proveedor,cliente,rfcprov,rfcclte);
            var seleccionados = seleccionadoss[0].total;

            if(total_cxp > 0 && total_cxc > 0 && seleccionados > 0 && total_cxc == total_cxp)
            {  
               var id = CrearPoliza(total_cxp,total_cxc,seleccionadoss,proveedor,cliente); //Crea Journal Entry
               //var id = CrearPoliza2(total_cxp,total_cxc,seleccionadoss,proveedor,cliente); // Crea compensación
               if (id > 0)
               {  

                  var host = "https://"
                  var cta = url.resolveDomain({hostType: url.HostType.APPLICATION});
                  //var cta = "debugger.na4.netsuite.com";
                  //var dire = "/app/accounting/transactions/custom.nl?id=" + id
                  var dire = "/app/accounting/transactions/journal.nl?id=" + id
                  var newURL = host + cta + dire;

                  var link = '<a href="' + newURL + '" target="_blank">Click aquí para ver el Registro.</a>';
                  var Mensajec = 'Se ha Generado la Transacción de Compensación puede revisarlo a través del siguiente enlace ' + link;
                  var idpagoBill = crearpago(id,seleccionadoss,proveedor,cliente,context);

                  /*if(idpagoBill == 2) 
                  {*/
                     var form = createForms(form,0); 
                     form.addPageInitMessage({ type: message.Type.CONFIRMATION, title: "Compensacion Creada Exitosamente", message: Mensajec });
                  /*}
                  else
                  {
                     var link = '<a href="' + newURL + '" target="_blank">Click aquí para ver el Registro.</a>';
                     var Mensajec = 'Se ha Generado exitosamente el dirio de la Transacción de Compensación ,sin embargo se generron errores al vinvular esta transacción con el Diario ,puede revisar el diario a través del siguiente enlace ' + link;

                     form.addPageInitMessage({
                     type: message.Type.WARNING,
                     title: "Error al Vincular la Poliza a las Transaciones", 
                     message: Mensajec, 
                     duration: 5000});                     
                  }*/


               }
               else
               {                    
                  form.addPageInitMessage({
                  type: message.Type.ERROR,
                  title: "Error al Generar la Poliza", 
                  message: 'Se generaron errores al intentar crear la Transacción de Compensación, Favor de Revisar el Log de errores', 
                  duration: 5000});
               }
            }

            if(total_cxp > 0 && total_cxc > 0 && seleccionados > 0 && total_cxc != total_cxp)
            {
               form.addPageInitMessage({
                  type: message.Type.ERROR,
                  title: "Saldos no Balanceados", 
                  message: 'El Total de Facturas de Cuentas por Pagar NO es igual al Total de Facturas de Cuentas por Cobrar, Favor de Revisar', 
                  duration: 5000});
            }
         }

      }
      catch(e)
      {
         log.error({title: 'main', details: "Mensaje de error :"+JSON.stringify(e)});
         var ok = 1;
      }

      return form;
   }

   function crearpago(id,seleccionadoss,prov,cte,context)
   {
      var conteo = 0;
      try
      {  
         
         var sel_bills = [];
         var sel_invoi = []; 
         var cuentax = traerids(seleccionadoss,prov,cte);
         var id_cxc = cuentax[0].CxC;
         var id_cxp = cuentax[0].CxP;

         var lineas = context.request.getLineCount({ group: "sublist_cxp" });
         var lineax = context.request.getLineCount({ group: "sublist_cxc" });

         ////  Seleccionas las Facturas de Compra \\\\\\
         for(var i=0; i<lineas;i++)
         {  
            var estado = context.request.getSublistValue({ group: 'sublist_cxp', name: 'custpage_check_cxp', line: i });
            if(estado == 'T')
            {  
               var Folio = context.request.getSublistValue({ group: 'sublist_cxp', name: 'custpage_doc_cxp', line: i });
               var Monto = context.request.getSublistValue({ group: 'sublist_cxp', name: 'custpage_saldo_cxp', line: i });
               sel_bills.push({ Folio : Folio, Monto : Monto });
            }
         }

         ////  Seleccionas las Facturas de Venta \\\\\\
         for(var i=0; i<lineax;i++)
         {  
            var estado = context.request.getSublistValue({ group: 'sublist_cxc', name: 'custpage_check_cxc', line: i });
            if(estado == 'T')
            {  
               var Folio = context.request.getSublistValue({ group: 'sublist_cxc', name: 'custpage_doc_cxc', line: i });
               var Monto = context.request.getSublistValue({ group: 'sublist_cxc', name: 'custpage_saldo_cxc', line: i });
               sel_invoi.push({ Folio : Folio, Monto : Monto });
            }
         }



         var objPaymentsdif = record.transform({
         fromType: 'vendorbill', 
         fromId: id_cxp,
         toType: 'vendorpayment',
         isDynamic: false
         }); 

         var totalCounts = objPaymentsdif.getLineCount({ sublistId: 'apply' });    //-Add Luis Angel Garcia 18/08/2022
         for (var indexs = 0; indexs < sel_bills.length; indexs++) 
         {  
            var tranid = sel_bills[indexs].Folio;
            for (var index = 0; index < totalCounts; index++) 
            {
               var idpolz = objPaymentsdif.getSublistValue({ sublistId: 'apply', fieldId: 'doc', line: index });
               var refnum = objPaymentsdif.getSublistValue({ sublistId: 'apply', fieldId: 'refnum', line: index });

               if (refnum == tranid) //Valida que sea el mismo ID Tran de Factura
               {
                  //objPaymentsdif.setCurrentSublistValue({ sublistId: 'apply', fieldId: 'apply', value: true });
                  objPaymentsdif.setSublistValue({sublistId: 'apply', fieldId: 'apply', line: index , value: true });
               } 

               if (idpolz == id)  // Valida que sea la Poliza
               {
                  //objPaymentsdif.setCurrentSublistValue({ sublistId: 'apply', fieldId: 'apply', value: true });
               }                       
            }
         }

         for (var index = 0; index < totalCounts; index++) 
         {
            var idpolz = objPaymentsdif.getSublistValue({ sublistId: 'apply', fieldId: 'doc', line: index });
            if (idpolz == id)  // Valida que sea la Poliza
            {
               //objPaymentsdif.setCurrentSublistValue({ sublistId: 'apply', fieldId: 'apply', value: true });
               objPaymentsdif.setSublistValue({sublistId: 'apply', fieldId: 'apply', line: index , value: true });
            }                       
         }

         var idpaymentbill = objPaymentsdif.save({ enableSourcing: true, ignoreMandatoryFields: true });
         if(idpaymentbill > 0){ conteo =1;}


         ///////////////////  CREAR PAGO DE INVOICE  \\\\\\\\\\\\\\\\\\\
         var objPaymentscte = record.transform({ 
         fromType: 'invoice', 
         fromId: id_cxc,
         toType: 'customerpayment',
         isDynamic: false
         }); 

         objPaymentscte.setValue({fieldId: 'custbody_mx_txn_sat_payment_method',value: 17,ignoreFieldChange: true});

         var totalCounts = objPaymentscte.getLineCount({ sublistId: 'apply' });    //-Add Luis Angel Garcia 18/08/2022
         var totalCounts2 = objPaymentscte.getLineCount({ sublistId: 'credit' });    //-Add Luis Angel Garcia 18/08/2022
         
         for (var indexs = 0; indexs < sel_invoi.length; indexs++) 
         {  
            var tranid = sel_invoi[indexs].Folio;
            for (var index = 0; index < totalCounts; index++) 
            {
               var refnum = objPaymentscte.getSublistValue({ sublistId: 'apply', fieldId: 'refnum', line: index });
               if (refnum == tranid) //Valida que sea el mismo ID Tran de Factura
               {
                  //objPaymentsdif.setCurrentSublistValue({ sublistId: 'apply', fieldId: 'apply', value: true });
                  objPaymentscte.setSublistValue({sublistId: 'apply', fieldId: 'apply', line: index , value: true });
               }                     
            }
         } 

         for (var index = 0; index < totalCounts2; index++) 
         {
            var idpoliza = objPaymentscte.getSublistValue({ sublistId: 'credit', fieldId: 'doc', line: index });
            if (idpoliza == id) //Valida que sea el mismo ID Tran de Factura
            {
               //objPaymentsdif.setCurrentSublistValue({ sublistId: 'credit', fieldId: 'apply', value: true });
               objPaymentscte.setSublistValue({sublistId: 'credit', fieldId: 'apply', line: index , value: true });
            }                       
         }
         var idpaymentinvc = objPaymentscte.save({ enableSourcing: true, ignoreMandatoryFields: true });
         if(idpaymentinvc > 0){ conteo = 2;}



      }
      catch(e)
      {
         log.error({title: 'crearpago', details: "Mensaje de error :"+JSON.stringify(e)});
         return -1;  
      }
      return conteo;
   }

   function verseleccionados(sublist_cxp,sublist_cxc)
   {  
      var indicadores = []; //Crea Arreglo que almacenara los resultados
      var conteo = 0;
      var Folio1 = 0;
      var Folio  = 0;
      try
      {
         for (var i = 0; i < sublist_cxp.length; i++)
         {  
            var valor = sublist_cxp[i].substring(0,1);
            if(valor == 'T')
            {  
               var linea = sublist_cxp[i].split('');
               var Folio = linea[2];
               conteo =+1;
            }
         }

         for (var i = 0; i < sublist_cxc.length; i++)
         {
            var valor = sublist_cxc[i].substring(0,1);
            if(valor == 'T')
            {  
               var linea = sublist_cxc[i].split('');
               var Folio1 = linea[2];
               conteo =+1;
            }
         }

         indicadores.push(
         {
            total: conteo, 
            CxC: Folio1,
            CxP: Folio
         });

      }
      catch(e)
      {
         log.error({title: 'verseleccionados', details: "Mensaje de error :"+JSON.stringify(e)});
         indicadores.push(
         {
            total: 0, 
            CxC: 0,
            CxP: 0
         });
         var ok = 1;
      }
      return indicadores;
   }

   function verseleccionados2(context)
   {  
      var indicadores = []; //Crea Arreglo que almacenara los resultados
      var conteo = 0;
      var Folio1 = 0;
      var Folio  = 0;
      try
      {
         var lineas = context.request.getLineCount({ 
         group: "sublist_cxp" });

         var lineax = context.request.getLineCount({ 
         group: "sublist_cxc" });

         
         for(var i=0; i<lineas;i++)
         {
            var estado = context.request.getSublistValue({ 
               group: 'sublist_cxp', 
               name: 'custpage_check_cxp', 
               line: i 
            });

            if(estado == 'T')
            {  
               var Folio = context.request.getSublistValue({ 
                  group: 'sublist_cxp', 
                  name: 'custpage_doc_cxp', 
                  line: i 
               });
               conteo =+1;
            }
         }
         

         for(var i=0; i<lineax;i++)
         {
            var estado = context.request.getSublistValue({ 
               group: 'sublist_cxc', 
               name: 'custpage_check_cxc', 
               line: i 
            });

            if(estado == 'T')
            {  
               var Folio1 = context.request.getSublistValue({ 
                  group: 'sublist_cxc', 
                  name: 'custpage_doc_cxc', 
                  line: i 
               });
               conteo =+1;
            }
         }

         indicadores.push(
         {
            total: conteo, 
            CxC: Folio1,
            CxP: Folio
         });

      }
      catch(e)
      {
         log.error({title: 'verseleccionados', details: "Mensaje de error :"+JSON.stringify(e)});
         indicadores.push(
         {
            total: 0, 
            CxC: 0,
            CxP: 0
         });
         var ok = 1;
      }
      return indicadores;
   }

   function formatDate(testDate)
   {
       var responseDate=format.format({value:testDate,type:format.Type.DATE});
       return responseDate;
   }

   function CrearPoliza(total_cxp,total_cxc,seleccionadoss,proveedor,cliente)
   {  
      var id = -1;
      try
      {     

            var Cuentax = traerctas(seleccionadoss,proveedor,cliente);

            var wsubsidiary = search.lookupFields({type: 'vendor', id: proveedor, columns: ['subsidiary']});
            var wsubsidiary = wsubsidiary.subsidiary[0].value;

            var wcurrency = search.lookupFields({type: 'vendor', id: proveedor, columns: ['currency']});
            var wcurrency = wcurrency.currency[0].value;

            var wexchangerate = 1;
            var cta_cxc = Cuentax[0].CxC;
            var cta_cxp = Cuentax[0].CxP;

            var date = new Date();
            var wtrandate = formatDate(date);
            
            var journalentry = record.create({
             type: record.Type.JOURNAL_ENTRY, 
             isDynamic: true
             });

            journalentry.setValue({fieldId: 'customform',value: 127,ignoreFieldChange: true});
            journalentry.setValue({fieldId: 'subsidiary',value: wsubsidiary,ignoreFieldChange: true});
            journalentry.setValue({fieldId: 'currency',value: wcurrency,ignoreFieldChange: true});
            journalentry.setValue({fieldId: 'approvalstatus',value: 2,ignoreFieldChange: true});
            journalentry.setValue({fieldId: 'memo',value: 'Compensación de Facturas',ignoreFieldChange: true});
            
            ////////////////// LINEA UNO \\\\\\\\\\\\\\\\\\
            journalentry.selectNewLine({sublistId: 'line'});
            journalentry.setCurrentSublistValue({sublistId: 'line', fieldId: 'account',value: cta_cxp, ignoreFieldChange: true});
            journalentry.setCurrentSublistValue({sublistId: 'line', fieldId: 'entity',value: proveedor, ignoreFieldChange: true});
            journalentry.setCurrentSublistValue({sublistId: 'line', fieldId: 'debit', value: total_cxp, ignoreFieldChange: true});
            journalentry.commitLine({sublistId: 'line'});
            ////////////////// LINEA UNO \\\\\\\\\\\\\\\\\\
            
            ////////////////// LINEA DOS \\\\\\\\\\\\\\\\\\
            journalentry.selectNewLine({sublistId: 'line'});
            journalentry.setCurrentSublistValue({sublistId: 'line', fieldId: 'account',value: cta_cxc, ignoreFieldChange: true});
            journalentry.setCurrentSublistValue({sublistId: 'line', fieldId: 'entity',value: cliente, ignoreFieldChange: true});
            journalentry.setCurrentSublistValue({sublistId: 'line', fieldId: 'credit', value: total_cxc, ignoreFieldChange: true});
            journalentry.commitLine({sublistId: 'line'});
            ////////////////// LINEA DOS \\\\\\\\\\\\\\\\\\

            ////////////////// LINEA TRES \\\\\\\\\\\\\\\\\\
            var monto = total_cxp * 0.16;
            journalentry.selectNewLine({sublistId: 'line'});
            journalentry.setCurrentSublistValue({sublistId: 'line', fieldId: 'account',value: 683, ignoreFieldChange: true});
            journalentry.setCurrentSublistValue({sublistId: 'line', fieldId: 'debit', value: monto, ignoreFieldChange: true});
            journalentry.commitLine({sublistId: 'line'});
            ////////////////// LINEA TRES \\\\\\\\\\\\\\\\\\
            
            ////////////////// LINEA CUAT \\\\\\\\\\\\\\\\\\
            journalentry.selectNewLine({sublistId: 'line'});
            journalentry.setCurrentSublistValue({sublistId: 'line', fieldId: 'account',value: 676, ignoreFieldChange: true});
            journalentry.setCurrentSublistValue({sublistId: 'line', fieldId: 'credit', value: monto, ignoreFieldChange: true});
            journalentry.commitLine({sublistId: 'line'});
            ////////////////// LINEA CUAT \\\\\\\\\\\\\\\\\\

            ////////////////// LINEA CINC \\\\\\\\\\\\\\\\\\
            var montoc = total_cxc * 0.16;
            journalentry.selectNewLine({sublistId: 'line'});
            journalentry.setCurrentSublistValue({sublistId: 'line', fieldId: 'account',value: 780, ignoreFieldChange: true});
            journalentry.setCurrentSublistValue({sublistId: 'line', fieldId: 'debit', value: montoc, ignoreFieldChange: true});
            journalentry.commitLine({sublistId: 'line'});
            ////////////////// LINEA CINC \\\\\\\\\\\\\\\\\\
            
            ////////////////// LINEA SEIS \\\\\\\\\\\\\\\\\\
            journalentry.selectNewLine({sublistId: 'line'});
            journalentry.setCurrentSublistValue({sublistId: 'line', fieldId: 'account',value: 778, ignoreFieldChange: true});
            journalentry.setCurrentSublistValue({sublistId: 'line', fieldId: 'credit', value: montoc, ignoreFieldChange: true});
            journalentry.commitLine({sublistId: 'line'});
            ////////////////// LINEA SEIS \\\\\\\\\\\\\\\\\\

            

            try
            {
               id = journalentry.save({enableSourcing: true, ignoreMandatoryFields: true});

            }
            catch(e)
            {  
               log.error({title: 'CrearPoliza - nlapiSubmitRecord', details: "Mensaje de error :"+JSON.stringify(e)});
               id = -1;
            }
            

      }
      catch(e)
      {
         log.error({title: 'CrearPoliza', details: "Mensaje de error :"+JSON.stringify(e)});
         var ok = 1;
      }
      return id;
   }

   function CrearPoliza2(total_cxp,total_cxc,seleccionadoss,proveedor,cliente)
   {  
      var id = -1;
      try
      {     

            var Cuentax = traerctas(seleccionadoss,proveedor,cliente);

            var wsubsidiary = search.lookupFields({type: 'vendor', id: proveedor, columns: ['subsidiary']});
            var wsubsidiary = wsubsidiary.subsidiary[0].value;

            var wcurrency = search.lookupFields({type: 'vendor', id: proveedor, columns: ['currency']});
            var wcurrency = wcurrency.currency[0].value;

            var wexchangerate = 1;
            var cta_cxc = Cuentax[0].CxC;
            var cta_cxp = Cuentax[0].CxP;

            var date = new Date();
            var wtrandate = formatDate(date);
            
            var compensacion = record.create({
             type: 'customtransaction_comp', 
             isDynamic: true
             });

            //compensacion.setValue({fieldId: 'customform',value: 127,ignoreFieldChange: true});
            compensacion.setValue({fieldId: 'subsidiary',value: wsubsidiary,ignoreFieldChange: true});
            compensacion.setValue({fieldId: 'currency',value: wcurrency,ignoreFieldChange: true});
            compensacion.setValue({fieldId: 'memo',value: 'Compensación de Facturas',ignoreFieldChange: true});
            
            ////////////////// LINEA UNO \\\\\\\\\\\\\\\\\\
            compensacion.selectNewLine({sublistId: 'line'});
            compensacion.setCurrentSublistValue({sublistId: 'line', fieldId: 'account',value: cta_cxp, ignoreFieldChange: true});
            compensacion.setCurrentSublistValue({sublistId: 'line', fieldId: 'entity',value: proveedor, ignoreFieldChange: true});
            compensacion.setCurrentSublistValue({sublistId: 'line', fieldId: 'debit', value: total_cxp, ignoreFieldChange: true});
            compensacion.commitLine({sublistId: 'line'});
            ////////////////// LINEA UNO \\\\\\\\\\\\\\\\\\
            
            ////////////////// LINEA DOS \\\\\\\\\\\\\\\\\\
            compensacion.selectNewLine({sublistId: 'line'});
            compensacion.setCurrentSublistValue({sublistId: 'line', fieldId: 'account',value: cta_cxc, ignoreFieldChange: true});
            compensacion.setCurrentSublistValue({sublistId: 'line', fieldId: 'entity',value: cliente, ignoreFieldChange: true});
            compensacion.setCurrentSublistValue({sublistId: 'line', fieldId: 'credit', value: total_cxc, ignoreFieldChange: true});
            compensacion.commitLine({sublistId: 'line'});
            ////////////////// LINEA DOS \\\\\\\\\\\\\\\\\\

            ////////////////// LINEA TRES \\\\\\\\\\\\\\\\\\
            var monto = total_cxp * 0.16;
            compensacion.selectNewLine({sublistId: 'line'});
            compensacion.setCurrentSublistValue({sublistId: 'line', fieldId: 'account',value: 683, ignoreFieldChange: true});
            compensacion.setCurrentSublistValue({sublistId: 'line', fieldId: 'debit', value: monto, ignoreFieldChange: true});
            compensacion.commitLine({sublistId: 'line'});
            ////////////////// LINEA TRES \\\\\\\\\\\\\\\\\\
            
            ////////////////// LINEA CUAT \\\\\\\\\\\\\\\\\\
            compensacion.selectNewLine({sublistId: 'line'});
            compensacion.setCurrentSublistValue({sublistId: 'line', fieldId: 'account',value: 676, ignoreFieldChange: true});
            compensacion.setCurrentSublistValue({sublistId: 'line', fieldId: 'credit', value: monto, ignoreFieldChange: true});
            compensacion.commitLine({sublistId: 'line'});
            ////////////////// LINEA CUAT \\\\\\\\\\\\\\\\\\

            ////////////////// LINEA CINC \\\\\\\\\\\\\\\\\\
            var montoc = total_cxc * 0.16;
            compensacion.selectNewLine({sublistId: 'line'});
            compensacion.setCurrentSublistValue({sublistId: 'line', fieldId: 'account',value: 780, ignoreFieldChange: true});
            compensacion.setCurrentSublistValue({sublistId: 'line', fieldId: 'debit', value: montoc, ignoreFieldChange: true});
            compensacion.commitLine({sublistId: 'line'});
            ////////////////// LINEA CINC \\\\\\\\\\\\\\\\\\
            
            ////////////////// LINEA SEIS \\\\\\\\\\\\\\\\\\
            compensacion.selectNewLine({sublistId: 'line'});
            compensacion.setCurrentSublistValue({sublistId: 'line', fieldId: 'account',value: 778, ignoreFieldChange: true});
            compensacion.setCurrentSublistValue({sublistId: 'line', fieldId: 'credit', value: montoc, ignoreFieldChange: true});
            compensacion.commitLine({sublistId: 'line'});
            ////////////////// LINEA SEIS \\\\\\\\\\\\\\\\\\

            

            try
            {
               id = compensacion.save({enableSourcing: true, ignoreMandatoryFields: true});

            }
            catch(e)
            {  
               log.error({title: 'CrearPoliza - nlapiSubmitRecord', details: "Mensaje de error :"+JSON.stringify(e)});
               id = -1;
            }
            

      }
      catch(e)
      {
         log.error({title: 'CrearPoliza', details: "Mensaje de error :"+JSON.stringify(e)});
         var ok = 1;
      }
      return id;
   }

   function traerctas(seleccionadoss,prov,cte)
   {  
      var indicadores = []; //Crea Arreglo que almacenara los resultados
      var cxp = 0;
      var cxc = 0;
      try
      {  
         try
         {  
            var ctp = seleccionadoss[0].CxP;

            var tipo = 'vendorbill';
            var filtros = [
             ['type', 'anyof', 'VendBill'],
             'AND',['status', 'anyof', 'VendBill:A'],
             'AND',['mainline', 'is', 'T'],
             'AND',['vendor.internalid', 'anyof', prov],
             'AND',['tranid', 'anyof', ctp],
            ];
            
            var searchInfo = search.create({
            type: tipo,
            filters: filtros,
            columns: [
              {name: 'trandate'},
              {name: 'account'},
              {name: 'amount'},
            ]
            });

            var resultset = searchInfo.run(); //Corre Busqueda
            try 
            {                 
                var results = resultset.getRange(0, 1000);
                for (var i = 0; i < results.length; i++) 
                {
                    var result = results[i];
                    var cxp = result.getValue('account')
                }
            }
            catch (error) 
            {
              log.error({title: 'Eror al Buscar Facturas - Agregar Reultados de la Busqueda', details: error});
              var cxp = 0;
            }

         }
         catch(e)
         {
              log.error({title: 'Eror al Buscar Facturas - Agregar Reultados de la Busqueda', details: error});
              var ok = 0;
         }

         try
         {  
            var ctp = seleccionadoss[0].CxC;
            var tipo = 'invoice';
            var filtros = [
             ['type', 'anyof', 'CustInvc'],
             'AND', ['status', 'anyof', 'CustInvc:A'],
             'AND', ['mainline', 'is', 'T'],
             'AND', ['customer.internalid', 'anyof', cte],
             'AND', ['tranid', 'anyof', ctp],
            ];

            var searchInfo = search.create({
            type: tipo,
            filters: filtros,
            columns: [
              {name: 'trandate'},
              {name: 'account'},
              {name: 'amount'},
            ]
            });

            var resultset = searchInfo.run(); //Corre Busqueda
            try 
            {                 
                var results = resultset.getRange(0, 1000);
                for (var i = 0; i < results.length; i++) 
                {
                    var result = results[i];
                    var cxc = result.getValue('account')
                }
            }
            catch (error) 
            {
              log.error({title: 'Eror al Buscar Facturas - Agregar Reultados de la Busqueda', details: error});
              var cxc = 0;
            }

         }
         catch(e)
         {
              log.error({title: 'Eror al Buscar Facturas - Agregar Reultados de la Busqueda', details: error});
              var ok = 0;
         }

         indicadores.push(
         {
            id: 0, 
            CxC: cxc,
            CxP: cxp
         });
      }
      catch(e)
      {
         log.error({title: 'Eror al Buscar Facturas', details: error});
         indicadores.push({ id: 0, CxC: 0, CxP: 0 });
         
      }

      return indicadores; 
   }

   function traerids(seleccionadoss,prov,cte)
   {  
      var indicadores = []; //Crea Arreglo que almacenara los resultados
      var cxp = 0;
      var cxc = 0;
      try
      {  
         try
         {  
            var ctp = seleccionadoss[0].CxP;

            var tipo = 'vendorbill';
            var filtros = [
             ['type', 'anyof', 'VendBill'],
             'AND',['status', 'anyof', 'VendBill:A'],
             'AND',['mainline', 'is', 'T'],
             'AND',['vendor.internalid', 'anyof', prov],
             'AND',['tranid', 'anyof', ctp],
            ];
            
            var searchInfo = search.create({
            type: tipo,
            filters: filtros,
            columns: [
              {name: 'trandate'},
              {name: 'account'},
              {name: 'internalid'},
              {name: 'amount'},
            ]
            });

            var resultset = searchInfo.run(); //Corre Busqueda
            try 
            {                 
                var results = resultset.getRange(0, 1000);
                for (var i = 0; i < results.length; i++) 
                {
                    var result = results[i];
                    var cxp = result.getValue('internalid')
                }
            }
            catch (error) 
            {
              log.error({title: 'Eror al Buscar Facturas - Agregar Reultados de la Busqueda', details: error});
              var cxp = 0;
            }

         }
         catch(e)
         {
              log.error({title: 'Eror al Buscar Facturas - Agregar Reultados de la Busqueda', details: error});
              var ok = 0;
         }

         try
         {  
            var ctp = seleccionadoss[0].CxC;
            var tipo = 'invoice';
            var filtros = [
             ['type', 'anyof', 'CustInvc'],
             'AND', ['status', 'anyof', 'CustInvc:A'],
             'AND', ['mainline', 'is', 'T'],
             'AND', ['customer.internalid', 'anyof', cte],
             'AND', ['tranid', 'anyof', ctp],
            ];

            var searchInfo = search.create({
            type: tipo,
            filters: filtros,
            columns: [
              {name: 'trandate'},
              {name: 'account'},
              {name: 'amount'},
              {name: 'internalid'},
            ]
            });

            var resultset = searchInfo.run(); //Corre Busqueda
            try 
            {                 
                var results = resultset.getRange(0, 1000);
                for (var i = 0; i < results.length; i++) 
                {
                    var result = results[i];
                    var cxc = result.getValue('internalid')
                }
            }
            catch (error) 
            {
              log.error({title: 'Eror al Buscar Facturas - Agregar Reultados de la Busqueda', details: error});
              var cxc = 0;
            }

         }
         catch(e)
         {
              log.error({title: 'Eror al Buscar Facturas - Agregar Reultados de la Busqueda', details: error});
              var ok = 0;
         }

         indicadores.push(
         {
            id: 0, 
            CxC: cxc,
            CxP: cxp
         });
      }
      catch(e)
      {
         log.error({title: 'Eror al Buscar Facturas', details: error});
         indicadores.push({ id: 0, CxC: 0, CxP: 0 });
         
      }

      return indicadores; 
   }

   function validactas(form,proveedor,cliente,rfcprov,rfcclte)
   {
      try
      {        

         if(cliente == undefined || cliente == "")
         {

            form.addFieldGroup({
               id: 'custpage_fg_results',
               label: 'Resultados'
            });

            var htmlImage = form.addField({
            id: 'custpage_htmlfield',
            type: serverWidget.FieldType.INLINEHTML,
            label: 'Resultados',
            container: 'custpage_fg_results'
            });
         
            htmlImage.defaultValue = "<br/><br/><h2 style='color: #565AB8;'>El Proveedor no contiene cliente Vinculado</h2>";
            
            form.updateDefaultValues({
             _proveedor : proveedor,
             _rfc_proveedor : rfcprov,
             _total_cxp : 0,
             _total_cxc : 0
            });

         }
         else
         {
            form.updateDefaultValues({
             _proveedor : proveedor,
             _cliente : cliente,
             _rfc_proveedor : rfcprov,
             _rfc_cliente : rfcclte,
             _total_cxp : 0,
             _total_cxc : 0
            });

            var sublist_cxp = form.addSublist({
            id : 'sublist_cxp',
            type : serverWidget.SublistType.LIST,
            label : 'Cuentas Por Pagar'
            });

            sublist_cxp.addField({
            id: 'custpage_check_cxp',
            label: 'Seleccionar',
            type: serverWidget.FieldType.CHECKBOX
            });

            var fecha_cxp = sublist_cxp.addField({
            id: 'custpage_date_cxp',
            label: 'Fecha',
            type: serverWidget.FieldType.DATE
            });
            fecha_cxp.updateDisplayType({displayType : serverWidget.FieldDisplayType.DISABLED});

            var doc_cxp = sublist_cxp.addField({
            id: 'custpage_doc_cxp',
            label: 'No. De Transacción',
            type: serverWidget.FieldType.TEXT
            });
            doc_cxp.updateDisplayType({displayType : serverWidget.FieldDisplayType.DISABLED});

            var impor_cxp = sublist_cxp.addField({
            id: 'custpage_importe_cxp',
            label: 'Importe',
            type: serverWidget.FieldType.CURRENCY
            });
            impor_cxp.updateDisplayType({displayType : serverWidget.FieldDisplayType.DISABLED});

            var pendiente_cxp = sublist_cxp.addField({
            id: 'custpage_pendiente_cxp',
            label: 'Saldo',
            type: serverWidget.FieldType.CURRENCY
            });
            pendiente_cxp.updateDisplayType({displayType : serverWidget.FieldDisplayType.DISABLED});

            var saldo_cxp = sublist_cxp.addField({
            id: 'custpage_saldo_cxp',
            label: 'Aplicación',
            type: serverWidget.FieldType.CURRENCY
            });
            saldo_cxp.updateDisplayType({displayType : serverWidget.FieldDisplayType.ENTRY});

            var id_cxp = sublist_cxp.addField({
            id: 'custpage_id_cxp',
            label: 'ID',
            type: serverWidget.FieldType.INTEGER
            });
            id_cxp.updateDisplayType({displayType : serverWidget.FieldDisplayType.HIDDEN});


            /////////////////Tabla CxC

            var sublist_cxc = form.addSublist({
            id : 'sublist_cxc',
            type : serverWidget.SublistType.LIST,
            label : 'Cuentas Por Cobrar'
            });

            sublist_cxc.addField({
            id: 'custpage_check_cxc',
            label: 'Seleccionar',
            type: serverWidget.FieldType.CHECKBOX
            });

            var fecha_cxc = sublist_cxc.addField({
            id: 'custpage_date_cxc',
            label: 'Fecha',
            type: serverWidget.FieldType.DATE
            });
            fecha_cxc.updateDisplayType({displayType : serverWidget.FieldDisplayType.DISABLED});

            var doc_cxc = sublist_cxc.addField({
            id: 'custpage_doc_cxc',
            label: 'No. De Transacción',
            type: serverWidget.FieldType.TEXT
            });
            doc_cxc.updateDisplayType({displayType : serverWidget.FieldDisplayType.DISABLED});

            var impor_cxc = sublist_cxc.addField({
            id: 'custpage_importe_cxc',
            label: 'Importe',
            type: serverWidget.FieldType.CURRENCY
            });
            impor_cxc.updateDisplayType({displayType : serverWidget.FieldDisplayType.DISABLED});

            var pendiente_cxc = sublist_cxc.addField({
            id: 'custpage_pendiente_cxc',
            label: 'Saldo',
            type: serverWidget.FieldType.CURRENCY
            });
            pendiente_cxc.updateDisplayType({displayType : serverWidget.FieldDisplayType.DISABLED});

            var saldo_cxc = sublist_cxc.addField({
            id: 'custpage_saldo_cxc',
            label: 'Aplicación',
            type: serverWidget.FieldType.CURRENCY
            });
            saldo_cxc.updateDisplayType({displayType : serverWidget.FieldDisplayType.ENTRY});

            var id_cxc = sublist_cxc.addField({
            id: 'custpage_id_cxc',
            label: 'ID',
            type: serverWidget.FieldType.INTEGER
            });
            id_cxc.updateDisplayType({displayType : serverWidget.FieldDisplayType.HIDDEN});

            var bills = BuscarFacturas(1,proveedor);
            if(bills.length > 0)
            {
               for (var i = 0; i < bills.length; i++)
               {

                  sublist_cxp.setSublistValue({
                   id: 'custpage_date_cxp',
                   line: i,
                   value: bills[i].Fecha
                  });

                  sublist_cxp.setSublistValue({
                   id: 'custpage_doc_cxp',
                   line: i,
                   value: bills[i].Folio
                  });

                  sublist_cxp.setSublistValue({
                   id: 'custpage_importe_cxp',
                   line: i,
                   value: bills[i].Total
                  });

                  sublist_cxp.setSublistValue({
                   id: 'custpage_pendiente_cxp',
                   line: i,
                   value: bills[i].Pendiente
                  });

                  sublist_cxp.setSublistValue({
                   id: 'custpage_id_cxp',
                   line: i,
                   value: bills[i].Internalid
                  });

               }

            }

            var invos = BuscarFacturas(2,cliente);
            if(invos.length > 0)
            {
               for (var i = 0; i < invos.length; i++)
               {

                  sublist_cxc.setSublistValue({
                   id: 'custpage_date_cxc',
                   line: i,
                   value: invos[i].Fecha
                  });

                  sublist_cxc.setSublistValue({
                   id: 'custpage_doc_cxc',
                   line: i,
                   value: invos[i].Folio
                  });

                  sublist_cxc.setSublistValue({
                   id: 'custpage_importe_cxc',
                   line: i,
                   value: invos[i].Total
                  });

                  sublist_cxc.setSublistValue({
                   id: 'custpage_pendiente_cxc',
                   line: i,
                   value: invos[i].Pendiente
                  });

                  sublist_cxc.setSublistValue({
                   id: 'custpage_id_cxc',
                   line: i,
                   value: invos[i].Internalid
                  });

               }

            }

         }

      }
      catch(e)
      {
         log.error({title: 'validactas', details: "Mensaje de error :"+JSON.stringify(e)});
         var ok = 1;
      }
      return form;
   }

   function BuscarFacturas(tipo,record)
   {
      var indicadores = []; //Crea Arreglo que almacenara los resultados

      try
      {  

         if(tipo ==1) //Proveedores
         {
            var tipo = 'vendorbill';
            var filtros = [
             ['type', 'anyof', 'VendBill'],
             'AND',['status', 'anyof', 'VendBill:A'],
             'AND',['mainline', 'is', 'T'],
             'AND',['vendor.internalid', 'anyof', record],
           ];
         }
         else
         {
            var tipo = 'invoice';
            var filtros = [
             ['type', 'anyof', 'CustInvc'],
             'AND', ['status', 'anyof', 'CustInvc:A'],
             'AND', ['mainline', 'is', 'T'],
             'AND', ['customer.internalid', 'anyof', record],
           ];
         }


         //Crea Busqueda Guardada para Leer Datos de Clasificacion
         var searchInfo = search.create({
         type: tipo,
         filters: filtros,
         columns: [
           {name: 'trandate'},
           {name: 'tranid'},
           {name: 'amount'},
           {name: 'amountremaining'},
           {name: 'internalid'},
         ]
         });
         
         var resultset = searchInfo.run(); //Corre Busqueda
         try 
         {                 
             var results = resultset.getRange(0, 1000);
             for (var i = 0; i < results.length; i++) 
             {
                 var result = results[i];
                 indicadores.push(
                 {
                  id: result.id, 
                  Fecha:      result.getValue('trandate'), 
                  Folio:      result.getValue('tranid'), 
                  Total:      result.getValue('amount'),
                  Pendiente:  result.getValue('amountremaining'),
                  Internalid: result.getValue('internalid')
                 });
                 //Agrega resultados de la busqueda al Array
             }
         }
         catch (error) 
         {
           log.error({title: 'Eror al Buscar Facturas - Agregar Reultados de la Busqueda', details: error});
           var indicadores = []; // En caso de error devuelve arrar vacio
         }

         return indicadores;
      }
      catch(error)
      {
          log.error({title: 'Eror al Buscar Facturas', details: error});
          return indicadores;
      }
   }

   function createForms(form,opcion) {

      form.addFieldGroup({
         id: 'custpage_fg_principal',
         label: 'Principal'
      });

      var _proveedor = form.addField({
         id: '_proveedor',
         label: 'Proveedor',
         type: serverWidget.FieldType.SELECT,
         container: 'custpage_fg_principal',
         source: 'vendor'
      });

      var rfc_proveedor = form.addField({
         id: '_rfc_proveedor',
         label: 'RFC Proveedor',
         type: serverWidget.FieldType.TEXT,
         container: 'custpage_fg_principal'
      });

      var total_cxp = form.addField({
         id: '_total_cxp',
         label: 'Total Facturas CXP',
         type: serverWidget.FieldType.CURRENCY,
         container: 'custpage_fg_principal'
      });

      var cliente = form.addField({
         id: '_cliente',
         label: 'Cliente',
         type: serverWidget.FieldType.SELECT,
         container: 'custpage_fg_principal',
         source: 'customer'
      });

      var rfc_cliente = form.addField({
         id: '_rfc_cliente',
         label: 'RFC Cliente',
         type: serverWidget.FieldType.TEXT,
         container: 'custpage_fg_principal'
      });

      var total_cxc = form.addField({
         id: '_total_cxc',
         label: 'Total Facturas CXC',
         type: serverWidget.FieldType.CURRENCY,
         container: 'custpage_fg_principal'
      });

      if(opcion == 0)
      {
         form.addSubmitButton({
            label : 'Buscar'
         });       
      }

      if(opcion == 1)
      {
         form.addSubmitButton({
            label : 'Generar Compensación'
         });       
      }


      form.addButton({
         id : 'clean',
         label : 'Limpiar',
         functionName : 'star'
      });


      return form;
   }


});