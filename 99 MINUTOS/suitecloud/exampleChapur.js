/**
 * @author Jaime Chavez <jaime.chavez@beexponential.com.mx>
 * @Name cha_sl_retenciones.js
 * @description Script de tipo suilet el cual crea el formulario para realizar las buquedas de impuestos retenidos, usando los filtros de subsidiaria, fecha inicial, fecha ifinal y codigo de impuestos
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
 define(["N/record","N/redirect","N/ui/serverWidget","N/search","N/ui/message","N/file","N/runtime",'N/encode'
  ], (record, redirect, serverWidget, search, message, file, runtime,encode) => {
    /**
     * Defines the Suitelet script trigger point.
     *@param {Object} context
     * @param {ServerRequest} context.request - Incoming request
     * @param {ServerResponse} context.response - Suitelet response
     * @since 2015.2
     */
    const onRequest = (context) => {
    
      switch (context.request.method) {
        
        case "GET": {
          let form = serverWidget.createForm({ title: "Impuestos Retenidos" });
          let sublist = createSublist(form);
          form.addFieldGroup({id: "search_fields",label: "Filtros de busqueda",});
          [
            {id: "custpage_cha_list_subsidiary",type: serverWidget.FieldType.SELECT,label: "Subsidiary",source: "subsidiary",is_mandatory: true,},
            {id: "custpage_cha_list_start_date",type: serverWidget.FieldType.DATE,label: "Start Date",},
            {id: "custpage_cha_list_end_date",type: serverWidget.FieldType.DATE,label: "End Date",},
          ].map((el) => {
            let field = form.addField(el);
            if (el.hasOwnProperty("is_mandatory") && el.is_mandatoy)
              field.isMandatory = true;
          });
  
          form.addSubmitButton({
            label: "Generar Busqueda",
          });
          context.response.writePage(form);
          break;
        }
  
        case "POST": {
          params = context.request.parameters;
          let submitter = params["submitter"];
          var data
          switch (submitter) {
  
            case "Generar Busqueda": {
              let form = serverWidget.createForm({
                title: "Impuesto Retenidos",
              });
              let sublist = createSublist(form);
              // form.addFieldGroup({id: "search_fields",label: "Filtros de busqueda",});
              // [
              //   {id: "custpage_cha_list_subsidiary",type: serverWidget.FieldType.SELECT,label: "Subsidiary",source: "subsidiary",is_mandatory: true,},
              //   {id: "custpage_cha_list_start_date",type: serverWidget.FieldType.DATE,label: "Start Date",},
              //   {id: "custpage_cha_list_end_date",type: serverWidget.FieldType.DATE,label: "End Date",},
              // ].map((el) => {
              //   let field = form.addField(el);
              //   if (el.hasOwnProperty("default_value"))
              //     field.defaultValue = el.default_value;
              // });
         
              data = getDataRequestQuote(params);
          
              data.map((el, index) => {
                sublist.requestquoteSublist.setSublistValue({id: "custpage_cha_sub_numerodefactura",value: el.numerodefactura || "Null",line: index,});
                sublist.requestquoteSublist.setSublistValue({id: "custpage_cha_sub_numerodetransaccion",value: el.numerodetransaccion || "Null",line: index,});
                sublist.requestquoteSublist.setSublistValue({id: "custpage_cha_sub_fechadefactura",value: el.fechadefactura || "Null",line: index,});
                sublist.requestquoteSublist.setSublistValue({id: "custpage_cha_sub_cuenta",value: el.cuenta || "Null",line: index,});
                sublist.requestquoteSublist.setSublistValue({id: "custpage_cha_sub_idproveedor",value: el.idproveedor || "Null",line: index,});
                sublist.requestquoteSublist.setSublistValue({id: "custpage_cha_sub_nobredelprveedor",value: el.nobredelprveedor || "Null",line: index,});
                sublist.requestquoteSublist.setSublistValue({id: "custpage_cha_sub_rfc",value: el.rfc || "Null",line: index,});
                sublist.requestquoteSublist.setSublistValue({id: "custpage_cha_sub_moneda",value: el.moneda || "Null",line: index,});
                sublist.requestquoteSublist.setSublistValue({id: "custpage_cha_sub_estadodelafactura",value: el.estadodelafactura || "Null",line: index,});
                sublist.requestquoteSublist.setSublistValue({id: "custpage_cha_sub_uuid",value: el.uuid || "Null",line: index,});
                sublist.requestquoteSublist.setSublistValue({id: "custpage_cha_sub_subtotalantesdeimp",value: el.subtotalantesdeimp || "Null",line: index,});
                sublist.requestquoteSublist.setSublistValue({id: "custpage_cha_sub_descantesdeimp",value: el.descantesdeimp || "Null",line: index,});
                sublist.requestquoteSublist.setSublistValue({id: "custpage_cha_sub_ivadescuento",value: el.ivadescuento || "Null",line: index,});
                sublist.requestquoteSublist.setSublistValue({id: "custpage_cha_sub_ivaretporhonorarios",value: el.ivaretporhonorarios || "Null",line: index,});
                sublist.requestquoteSublist.setSublistValue({id: "custpage_cha_sub_ivaretporarrend",value: el.ivaretporarrend || "Null",line: index,});
                sublist.requestquoteSublist.setSublistValue({id: "custpage_cha_sub_ivaretporflete",value: el.ivaretporflete || "Null",line: index,});
                sublist.requestquoteSublist.setSublistValue({id: "custpage_cha_sub_ivaretporoutsourcing",value: el.ivaretporoutsourcing || "Null",line: index,});
                sublist.requestquoteSublist.setSublistValue({id: "custpage_cha_sub_totalivaret",value: el.totalivaret || "Null",line: index,});
                sublist.requestquoteSublist.setSublistValue({id: "custpage_cha_sub_isrretporhonorarios",value: el.isrretporhonorarios || "Null",line: index,});
                sublist.requestquoteSublist.setSublistValue({id: "custpage_cha_sub_isrretporarrend",value: el.isrretporarrend || "Null",line: index,});
                sublist.requestquoteSublist.setSublistValue({id: "custpage_cha_sub_isrretporflete",value: el.isrretporflete || "Null",line: index,});
                sublist.requestquoteSublist.setSublistValue({id: "custpage_cha_sub_totalisrret",value: el.totalisrret || "Null",line: index,});
                sublist.requestquoteSublist.setSublistValue({id: "custpage_cha_sub_impsobrenomret",value: el.impsobrenomret || "Null",line: index,});
                sublist.requestquoteSublist.setSublistValue({id: "custpage_cha_sub_netofactura",value: el.netofactura || "Null",line: index,});
                sublist.requestquoteSublist.setSublistValue({id: "custpage_cha_sub_montoanticipo",value: el.montoanticipo || "Null",line: index,});
                sublist.requestquoteSublist.setSublistValue({id: "custpage_cha_sub_ivadeanticipo",value: el.ivadeanticipo || "Null",line: index,});
                sublist.requestquoteSublist.setSublistValue({id: "custpage_cha_sub_numdeopdelant",value: el.numdeopdelant || "Null",line: index,});
                sublist.requestquoteSublist.setSublistValue({id: "custpage_cha_sub_fechapagoanticipo",value: el.fechapagoanticipo || "Null",line: index,});
                sublist.requestquoteSublist.setSublistValue({id: "custpage_cha_sub_tipopagodeanticipo",value: el.tipopagodeanticipo || "Null",line: index,});
                sublist.requestquoteSublist.setSublistValue({id: "custpage_cha_sub_nodefolioanticipo",value: el.nodefolioanticipo || "Null",line: index,});
                sublist.requestquoteSublist.setSublistValue({id: "custpage_cha_sub_fechapagfactura",value: el.fechapagfactura || "Null",line: index,});
                sublist.requestquoteSublist.setSublistValue({id: "custpage_cha_sub_numerodecheque",value: el.numerodecheque || "Null",line: index,});
                sublist.requestquoteSublist.setSublistValue({id: "custpage_cha_sub_estadodecheque",value: el.estadodecheque || "Null",line: index,});
                sublist.requestquoteSublist.setSublistValue({id: "custpage_cha_sub_tipopago",value: el.tipopago || "Null",line: index,});
                sublist.requestquoteSublist.setSublistValue({id: "custpage_cha_sub_poliza",value: el.poliza || "Null",line: index,});
                sublist.requestquoteSublist.setSublistValue({id: "custpage_cha_sub_fechadepoliza",value: el.fechadepoliza || "Null",line: index,});
              });
             
              var csvCVClient="NUMERO DE FACTURA,NUMERO DE TRANSACCION,FECHA DE FACTURA,CUENTA,ID PROVEEDOR,NOBREDEL PROVEEDOR,RFC,MONEDA,ESTADO DE LA FACTURA,UUID,SUBTOTAL ANTES DEIMP,DESCUENTO ANTES DE IMPUESTOS,IVA DESCUENTO,IVA RETENIDO POR HONORARIOS,IVA RETENIDO POR ARRENDAMIENTO,IVA RETENIDO POR FLETES,IVA RETENIDO POR OUTSOURCING,TOTAL IVA RETENIDO,ISR RETENIDO POR HONORARIOS,ISR RETENIDO POR ARRENDAMIENTO,ISR RETENIDO POR FLETE,TOTAL ISR RETENIDO,IMPUESTOS SOBRE NÓMINA RETENIDA,NETO FACTURA,MONTO ANTICIPO,IVA DE ANTICIPO,NÍMERO DE OPERACION DEL ANTICIPO,FECHA PAGO ANTICIPO,TIPO PAGO DE ANTICIPO,NO. DE FOLIO ANTICIPO,FECHA PAGO FACTURA,NUMERO DE CHEQUE,ESTADO DE CHEQUE,TIPO PAGO,POLIZA,FECHA DE POLIZA,\n"
                    
              data.forEach(element => {
                  csvCVClient+=element.numerodefactura+","+element.numerodetransaccion+","+element.fechadefactura+","+element.cuenta+","+element.idproveedor+","+element.nobredelprveedor+","+element.rfc+","+element.moneda+","+element.estadodelafactura+","+element.uuid+","+element.subtotalantesdeimp+","+element.descantesdeimp+","+element.ivadescuento+","+element.ivaretporhonorarios+","+element.ivaretporarrend+","+element.ivaretporflete+","+element.ivaretporoutsourcing+","+element.totalivaret+","+element.isrretporhonorarios+","+element.isrretporarrend+","+element.isrretporflete+","+element.totalisrret+","+element.impsobrenomret+","+element.netofactura+","+element.montoanticipo+","+element.ivadeanticipo+","+element.numdeopdelant+","+element.fechapagoanticipo+","+element.tipopagodeanticipo+","+element.nodefolioanticipo+","+element.fechapagfactura+","+element.numerodecheque+","+element.estadodecheque+","+element.tipopago+","+element.poliza+","+element.fechadepoliza+"\n";
              });
              form.clientScriptModulePath = 'SuiteScripts/impuestos/cha_cs_impuestos_report.js'; 
              csvCVClient = encode.convert({
                  string: csvCVClient,
                  inputEncoding: encode.Encoding.UTF_8,
                  outputEncoding: encode.Encoding.BASE_64
              });                           
              form.addButton({
                  id : 'gue_btn_excel',
                  label: 'Generar Excel',
                  functionName: "generateFile('"+csvCVClient+"')"
              });   

              context.response.writePage(form);                   
              break;
            }
        }   
        break;
        }
      }
    };
  
    return {
      onRequest,
    };
      //FUNCTION X1
    //Pintado de las columnas en la interfaz del sitio 
    function createSublist(form) {
      let requestquoteSublist = form.addSublist({id: "custpage_ges_sublist_item",type: serverWidget.SublistType.LIST,label: "Impuesto Retenidos",});
      [
        {id: "custpage_cha_sub_numerodefactura",type: serverWidget.FieldType.TEXT,label: "numero de factura",display_type: serverWidget.FieldDisplayType.INLINE,},
        {id: "custpage_cha_sub_numerodetransaccion",type: serverWidget.FieldType.TEXT,label: "numero de transaccion",display_type: serverWidget.FieldDisplayType.INLINE,},
        {id: "custpage_cha_sub_fechadefactura",type: serverWidget.FieldType.TEXT,label: "fecha de factura",display_type: serverWidget.FieldDisplayType.INLINE,},
        {id: "custpage_cha_sub_cuenta",type: serverWidget.FieldType.TEXT,label: "cuenta",display_type: serverWidget.FieldDisplayType.INLINE,},
        {id: "custpage_cha_sub_idproveedor",type: serverWidget.FieldType.TEXT,label: "id proveedor",display_type: serverWidget.FieldDisplayType.INLINE,},
        {id: "custpage_cha_sub_nobredelprveedor",type: serverWidget.FieldType.TEXT,label: "nobredel proveedor",display_type: serverWidget.FieldDisplayType.INLINE,},
        {id: "custpage_cha_sub_rfc",type: serverWidget.FieldType.TEXT,label: "rfc",display_type: serverWidget.FieldDisplayType.INLINE,},
        {id: "custpage_cha_sub_moneda",type: serverWidget.FieldType.TEXT,label: "moneda",display_type: serverWidget.FieldDisplayType.INLINE,},
        {id: "custpage_cha_sub_estadodelafactura",type: serverWidget.FieldType.TEXT,label: "estado de la factura",display_type: serverWidget.FieldDisplayType.INLINE,},
        {id: "custpage_cha_sub_uuid",type: serverWidget.FieldType.TEXT,label: "uuid",display_type: serverWidget.FieldDisplayType.INLINE,},
        {id: "custpage_cha_sub_subtotalantesdeimp",type: serverWidget.FieldType.TEXT,label: "subtotal antes deimp",display_type: serverWidget.FieldDisplayType.INLINE,},
        {id: "custpage_cha_sub_descantesdeimp",type: serverWidget.FieldType.TEXT,label: "descuento antes de impuestos",display_type: serverWidget.FieldDisplayType.INLINE,},
        //retenidos
        {id: "custpage_cha_sub_ivadescuento",type: serverWidget.FieldType.TEXT,label: "iva descuento",display_type: serverWidget.FieldDisplayType.INLINE,},
        {id: "custpage_cha_sub_ivaretporhonorarios",type: serverWidget.FieldType.TEXT,label: "iva retenido por honorarios",display_type: serverWidget.FieldDisplayType.INLINE,},
        {id: "custpage_cha_sub_ivaretporarrend",type: serverWidget.FieldType.TEXT,label: "iva retenido por arrendamiento",display_type: serverWidget.FieldDisplayType.INLINE,},
        {id: "custpage_cha_sub_ivaretporflete",type: serverWidget.FieldType.TEXT,label: "iva retenido por fletes",display_type: serverWidget.FieldDisplayType.INLINE,},
        {id: "custpage_cha_sub_ivaretporoutsourcing",type: serverWidget.FieldType.TEXT,label: "iva retenido por outsourcing",display_type: serverWidget.FieldDisplayType.INLINE,},
        {id: "custpage_cha_sub_totalivaret",type: serverWidget.FieldType.TEXT,label: "total iva retenido",display_type: serverWidget.FieldDisplayType.INLINE,},
        {id: "custpage_cha_sub_isrretporhonorarios",type: serverWidget.FieldType.TEXT,label: "isr retenido por honorarios",display_type: serverWidget.FieldDisplayType.INLINE,},
        {id: "custpage_cha_sub_isrretporarrend",type: serverWidget.FieldType.TEXT,label: "isr retenido por arrendamiento",display_type: serverWidget.FieldDisplayType.INLINE,},
        {id: "custpage_cha_sub_isrretporflete",type: serverWidget.FieldType.TEXT,label: "isr retenido por flete",display_type: serverWidget.FieldDisplayType.INLINE,},
        {id: "custpage_cha_sub_totalisrret",type: serverWidget.FieldType.TEXT,label: "total isr retenido",display_type: serverWidget.FieldDisplayType.INLINE,},
        {id: "custpage_cha_sub_impsobrenomret",type: serverWidget.FieldType.TEXT,label: "impuestos sobre nómina retenida",display_type: serverWidget.FieldDisplayType.INLINE,},
        //Fin retenidos
        {id: "custpage_cha_sub_netofactura",type: serverWidget.FieldType.TEXT,label: "neto factura",display_type: serverWidget.FieldDisplayType.INLINE,},
        {id: "custpage_cha_sub_montoanticipo",type: serverWidget.FieldType.TEXT,label: "monto anticipo",display_type: serverWidget.FieldDisplayType.INLINE,},
        {id: "custpage_cha_sub_ivadeanticipo",type: serverWidget.FieldType.TEXT,label: "iva de anticipo",display_type: serverWidget.FieldDisplayType.INLINE,},
        {id: "custpage_cha_sub_numdeopdelant",type: serverWidget.FieldType.TEXT,label: "nímero de operacion del anticipo",display_type: serverWidget.FieldDisplayType.INLINE,},
        {id: "custpage_cha_sub_fechapagoanticipo",type: serverWidget.FieldType.TEXT,label: "fecha pago anticipo",display_type: serverWidget.FieldDisplayType.INLINE,},
        {id: "custpage_cha_sub_tipopagodeanticipo",type: serverWidget.FieldType.TEXT,label: "tipo pago de anticipo",display_type: serverWidget.FieldDisplayType.INLINE,},
        {id: "custpage_cha_sub_nodefolioanticipo",type: serverWidget.FieldType.TEXT,label: "No. de folio anticipo",display_type: serverWidget.FieldDisplayType.INLINE,},
        {id: "custpage_cha_sub_fechapagfactura",type: serverWidget.FieldType.TEXT,label: "fecha pago factura",display_type: serverWidget.FieldDisplayType.INLINE,},
        {id: "custpage_cha_sub_numerodecheque",type: serverWidget.FieldType.TEXT,label: "numero de cheque",display_type: serverWidget.FieldDisplayType.INLINE,},
        {id: "custpage_cha_sub_estadodecheque",type: serverWidget.FieldType.TEXT,label: "estado de cheque",display_type: serverWidget.FieldDisplayType.INLINE,},
        {id: "custpage_cha_sub_tipopago",type: serverWidget.FieldType.TEXT,label: "tipo pago",display_type: serverWidget.FieldDisplayType.INLINE,},
        {id: "custpage_cha_sub_poliza",type: serverWidget.FieldType.TEXT,label: "poliza",display_type: serverWidget.FieldDisplayType.INLINE,},
        {id: "custpage_cha_sub_fechadepoliza",type: serverWidget.FieldType.TEXT,label: "fecha de poliza",display_type: serverWidget.FieldDisplayType.INLINE,},
      ].map((el) => {
          let field = requestquoteSublist.addField(el);
          if (el.hasOwnProperty("display_type"))
          field.updateDisplayType({displayType: el.display_type,})
          if (el.hasOwnProperty("default_value")) 
          field.defaultValue = el.default_value; 
      
      });
  
      return {
        requestquoteSublist,
      };
    }
  //FUNCTIONS X2
    function getDataRequestQuote(params) {
      //Filtro pormedio de los inputs de mi formulario
      let filters = [
        ["type", "anyof", "VendBill"],
        "AND",
        ["trandate","within",params["custpage_cha_list_start_date"],params["custpage_cha_list_end_date"],],
        "AND",
        ["subsidiary", "anyof", params["custpage_cha_list_subsidiary"]],
        "AND",
        ["mainline", "is", "T"],
      ];
  
      let info = [];
  
      var search_invoices = search.create({
        type: "transaction",
        filters: filters,
        columns: [
          (search_numerodefactura = search.createColumn({name: "internalid",label: "Número de Factura",})),
          (search_transaccion = search.createColumn({name: "transactionnumber",label: "Número de Transacción",})),
          (search_fecha = search.createColumn({name: "trandate",label: "Fecha Factura",})),
          (search_cuenta = search.createColumn({name: "account",label: "Cuenta",})),
          (search_idproveedor = search.createColumn({name: "entity",label: "idproveedor",})),
          (search_nobredelprveedor = search.createColumn({name: "custbody_bex_vendorname",label: "Nombre de Proveedor",})),
          (search_rfc = search.createColumn({name: "custentity_be_rfc_sat",join: "vendor",label: "RFC",})),
          (search_moneda = search.createColumn({name: "currency",label: "Moneda",})),
          (search_estadodelafactura = search.createColumn({name: "statusref",label: "Status",})),
          (search_uuid = search.createColumn({name: "custbody_be_uuid_sat",label: "UUID",})), //OK
          (search_pais = search.createColumn({name: "custentity_be_countrycode_sat",join: "vendor",label: "Pais",})),
          (search_tipodeoperacion = search.createColumn({name: "custentity_be_tipo_operacion",join: "vendor",label: "Tipo de Operación (DIOT)",})),
          (search_tipodetercero = search.createColumn({name: "custentity_be_tipo_tercero",join: "vendor",label: "Tipo de Tercero (DIOT)",})),
          (search_subtotalantesdeimp = search.createColumn({name: "netamountnotax",label: "Amount (Net of Tax)",})),
          //search_basenoafectosdeiva=null,
          (search_descantesdeimp = search.createColumn({name: "discountamount",label: "Amount Discount",})),
          //search_ivadescuento=null,
          //search_ivaretporoutsourcing=null,
          //search_isrretporhonorarios=null,
          //search_isrretporarrend=null,
          //search_isrretporflete=null,
          //search_totalisrret=null,
          //search_impsobrenomret=null,
          (search_netofactura = search.createColumn({name: "totalamount",label: "Total",})),
          (search_montoanticipo = search.createColumn({name: "custbody_bex_importe_del_anticipo",label: "xD",})),
          //search_ivadeanticipo=,
          (search_numdeopdelant = search.createColumn({name: "internalid",join: "CUSTRECORD_BEX_PARENT_BILL_VENDOR",label: "Internal ID",})),
          (search_fechapagoanticipo = search.createColumn({name: "custrecord_bex_advances_date",join: "CUSTRECORD_BEX_PARENT_BILL_VENDOR",label: "Fecha del anticipo",})),
          //search_tipopagodeanticipo=,
          (search_nodefolioanticipo = search.createColumn({name: "custrecord_bex_advance_id",join: "CUSTRECORD_BEX_PARENT_BILL_VENDOR",label: "Id anticipo",})),
          (search_numcheque = search.createColumn({name: "internalid",join: "payingTransaction",label: "Internal ID",})),
          (search_tipopago = search.createColumn({name: "custbody_be_methodpayment_sat",label: "Internal ID",})),
          (search_poliza = search.createColumn({name: "custrecord_rj_journal",join: "CUSTRECORD_RJ_PARENT_TRANSACTION",label: "Internal ID",})),
          (search_fechadepoliza = search.createColumn({name: "created",join: "CUSTRECORD_RJ_PARENT_TRANSACTION",label: "Date",})),
        ],
      });
  
      var pagedData1 = search_invoices.runPaged({ pageSize: 1000 });
  
      for (var i = 0; i < pagedData1.pageRanges.length; i++) {
        var currentPage1 = pagedData1.fetch(i);
        currentPage1.data.forEach(function (result) {
          var search_items = search.create({
            type: "transaction",
            filters: [
              ["type", "anyof", "VendBill"],
              "AND",
              ["mainline", "is", "F"],
              "AND",
              ["internalid", "anyof", result.getValue(search_numerodefactura)],
              "AND",
              ["item.type","anyof","@NONE@","InvtPart","NonInvtPart","Service",],
            ],
            columns: [
              (search_taxcode = search.createColumn({name: "taxcode",label: "TipoImpuesto",})),
              (search_taxamount = search.createColumn({name: "taxamount",label: "TotalTax",})),
            ],
          });
  
          var taxunk = 0,ivarethon = 0,ivaretarr = 0,ivaretflet = 0;
          var pagedData2 = search_items.runPaged({ pageSize: 1000 });
          for (var i = 0; i < pagedData2.pageRanges.length; i++) {
            var currentPage2 = pagedData2.fetch(i);
            currentPage2.data.forEach(function (result2) {
              var tax = result2.getValue(search_taxcode);
  
              var taxvalue = parseFloat(result2.getValue(search_taxamount));
  
              if (tax < 0) {
                tax = tax * -1;
              }
              if (taxvalue < 0) {
                taxvalue = taxvalue * -1;
              }
              if (taxvalue != 0 || taxvalue != null) {
                if (tax == 20) {
                    ivarethon += taxvalue;
                } else if (tax == 21) {
                    ivaretarr += taxvalue;
                } else if (tax == 22) {
                    ivaretflet += taxvalue;
                } else {
                    taxunk = taxvalue;
              }
              }
            });
          }    
          var fechapag_factura,
            estadode_cheque = null;
          //  var myResult3=null;
          if (result.getValue(search_numcheque) > 0) {
            var search_payment = search.create({
              type: "vendorpayment",
              filters: [
                ["type", "anyof", "VendPymt"],
                "AND",
                ["mainline", "is", "T"],
                "AND",
                ["internalid", "anyof", result.getValue(search_numcheque)],
              ],
              columns: [
                (search_fechapagfactura = search.createColumn({name: "trandate",label: "Fecha de depósito",})),
                (search_estadodecheque = search.createColumn({name: "statusref",label: "Status",})),
              ],
            });
            var pagedData3 = search_payment.runPaged({ pageSize: 1000 });
  
            for (var i = 0; i < pagedData3.pageRanges.length; i++) {
              var currentPage = pagedData3.fetch(i);
              currentPage.data.forEach(function (result3) {
                if (result3 != null) {
                  fechapag_factura = result3.getValue(search_fechapagfactura);
                  estadode_cheque = result3.getValue(search_estadodecheque);
                }
              });
            }
          }
          info.push({
            numerodefactura: result.getValue(search_numerodefactura),
            numerodetransaccion: result.getValue(search_transaccion),
            fechadefactura: result.getValue(search_fecha),
            cuenta: result.getText(search_cuenta),
            idproveedor: result.getValue(search_idproveedor),
            nobredelprveedor: result.getValue(search_nobredelprveedor),
            rfc: result.getValue(search_rfc),
            moneda: result.getText(search_moneda),
            estadodelafactura: result.getValue(search_estadodelafactura),
            uuid: result.getValue(search_uuid),
            subtotalantesdeimp: result.getValue(search_subtotalantesdeimp),
            descantesdeimp: result.getValue(search_descantesdeimp),
            ivadescuento: null, //1
            ivaretporhonorarios: ivarethon,
            ivaretporarrend: ivaretarr,
            ivaretporflete: ivaretflet,
            ivaretporoutsourcing: null, //2
            totalivaret: ivarethon + ivaretarr + ivaretflet,
            isrretporhonorarios: null, //3
            isrretporarrend: null, //4
            isrretporflete: null, //5
            totalisrret: null, //6
            impsobrenomret: null, //7
            netofactura: result.getValue(search_netofactura),
            montoanticipo: result.getValue(search_montoanticipo),
            ivadeanticipo: null, //8
            numdeopdelant: result.getValue(search_numcheque),
            fechapagoanticipo: result.getValue(search_fechapagoanticipo),
            tipopagodeanticipo: null, //9
            nodefolioanticipo: result.getValue(search_nodefolioanticipo),
            fechapagfactura: fechapag_factura,
            numerodecheque: result.getValue(search_numcheque),
            estadodecheque: estadode_cheque,
            tipopago: result.getText(search_tipopago),
            poliza: result.getValue(search_poliza),
            fechadepoliza: result.getValue(search_fechadepoliza),
          });
        });
      }
      return info;
    }
  });
  