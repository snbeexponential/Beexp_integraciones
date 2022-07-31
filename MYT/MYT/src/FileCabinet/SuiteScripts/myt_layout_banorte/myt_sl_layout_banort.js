/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/encode', 'N/record', 'N/redirect', 'N/search','N/ui/serverWidget'],
    /**
 * @param{encode} encode
 * @param{record} record
 * @param{redirect} redirect
 * @param{search} search
 */
    (encode, record, redirect, search,serverWidget) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (context) => {                
                        let form = serverWidget.createForm({
                            title: 'Banorte test'
                        });

                        let sublist = createSublist(form);
                        
                        form.addFieldGroup({
                            id: 'search_fields',
                            label: 'Filtros de busqueda'
                        });
                 /*        [{id: 'custpage_cha_list_subsidiary',type: serverWidget.FieldType.SELECT,label: 'Subsidiary',source: 'subsidiary',is_mandatory: true},
                        {id: 'custpage_cha_list_start_date',type: serverWidget.FieldType.DATE,label: 'Start Date'},
                        {id: 'custpage_cha_list_end_date',type: serverWidget.FieldType.DATE,label: 'End Date'}
                    ].map((el) => {
                        let field = form.addField(el)
                        if (el.hasOwnProperty('default_value')) field.defaultValue = el.default_value;
                    }) */
                    
                    let data = getDataRequestQuote();
                    
                    data.map((el, index) => {
                        sublist.requestquoteSublist.setSublistValue({id:'custpage_myt_sub_id',value:el.id ||'   ',line:index})                                    
                        sublist.requestquoteSublist.setSublistValue({id:'custpage_myt_sub_pagoperacion',value:el.pagoperacion || '  ',line:index})                                    
                        sublist.requestquoteSublist.setSublistValue({id:'custpage_myt_sub_entity',value:el.entity || '  ',line:index})
                        sublist.requestquoteSublist.setSublistValue({id:'custpage_myt_sub_catorig',value:el.catOrig || '    ',line:index})
                        sublist.requestquoteSublist.setSublistValue({id:'custpage_myt_sub_pagodestino',value:el.pagodestino || '    ',line:index})
                        sublist.requestquoteSublist.setSublistValue({id:'custpage_myt_sub_amount',value:el.amount || '  ',line:index})
                        sublist.requestquoteSublist.setSublistValue({id:'custpage_myt_sub_refpago',value:el.refPago || '    ',line:index})
                        
                    });
                    
                    let csvCVClient="saltodelinea\n"
                    
                   /*  data.forEach(element => {
                        csvCVClient+=element.numerodefactura+","+element.fechadepoliza+"\n"
                    }); */
                    
                    form.clientScriptModulePath = 'SuiteScripts/myt_layout_banorte/myt_cs_banorte_report.js'; 
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
        }

        return {onRequest}
        function createSublist(form) {
            let requestquoteSublist = form.addSublist({id: 'custpage_get_sublist_item',type: serverWidget.SublistType.LIST,label: 'Resultado layout Banorte'});
            [
                {id:'custpage_myt_sub_id',type:serverWidget.FieldType.TEXT,label:"id",display_type:serverWidget.FieldDisplayType.INLINE},
                {id:'custpage_myt_sub_pagoperacion',type:serverWidget.FieldType.TEXT,label:"pagoperacion",display_type:serverWidget.FieldDisplayType.INLINE},
                {id:'custpage_myt_sub_entity',type:serverWidget.FieldType.TEXT,label:"entity",display_type:serverWidget.FieldDisplayType.INLINE},
                {id:'custpage_myt_sub_catorig',type:serverWidget.FieldType.TEXT,label:"catOrig",display_type:serverWidget.FieldDisplayType.INLINE},
                {id:'custpage_myt_sub_pagodestino',type:serverWidget.FieldType.TEXT,label:"pagodestino",display_type:serverWidget.FieldDisplayType.INLINE},
                {id:'custpage_myt_sub_amount',type:serverWidget.FieldType.TEXT,label:"amount",display_type:serverWidget.FieldDisplayType.INLINE},
                {id:'custpage_myt_sub_refpago',type:serverWidget.FieldType.TEXT,label:"refPago",display_type:serverWidget.FieldDisplayType.INLINE}
            ].map((el) => {
                log.debug("El dato",el)
                let field = requestquoteSublist.addField(el);
                if (el.hasOwnProperty('display_type')) field.updateDisplayType({
                    displayType: el.display_type
                });
                if (el.hasOwnProperty('default_value')) field.defaultValue = el.default_value;
                
            });
            return{
                requestquoteSublist
            }
        }
    
        
        function getDataRequestQuote() {
            let transactionSearchObj = search.create({
                type: "transaction",
                filters:
                [
                   ["mainline","is","T"], 
                   "AND", 
                   ["type","anyof","VendBill"], 
                   "AND", 
                   ["employee","anyof","@ALL@"], 
                   "AND", 
                   ["unitstype","anyof","@ALL@"], 
                   "AND", 
                   ["status","anyof","VendBill:A"]
                ],
                columns:
                [
                   search_id="internalid",
                   search_pagoperacion="custbody_bex_pagosoperacion",
                   search_entity="entity",
                   search_catOrig="custbody_bex_pagosctaorigen",
                   search_pagodestino="custbody_beex_pagoctadestino",
                   search_amount="amount",
                   search_refPago="custbody_beex_referenciapago",
                   search.createColumn({
                      name: "tranid",
                      sort: search.Sort.ASC
                   })
                ]
             });
             let searchResultCount = transactionSearchObj.runPaged({pageSize : 1000});
             let info=[]
             for( let i=0; i < searchResultCount.pageRanges.length; i++ ) {
                let currentPage1 = searchResultCount.fetch(i);
                currentPage1.data.forEach( function(result) {
                    info.push({
                        id:result.getValue(search_id),
                        pagoperacion:result.getValue(search_pagoperacion),
                        entity:result.getValue(search_entity),
                        catOrig:result.getValue(search_catOrig),
                        pagodestino:result.getValue(search_pagodestino),
                        amount:result.getValue(search_amount),
                        refPago:result.getValue(search_refPago)
                    })

                })
            }
            return info
                }
            
    });
