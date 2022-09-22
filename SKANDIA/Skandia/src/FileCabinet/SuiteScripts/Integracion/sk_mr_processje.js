/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 * @NAmdConfig ../excel_module/sk_sc_excel_conf.json
 */
 define(['N/email', 'N/file', 'N/record','N/search',"xlsx",'N/runtime'],
 /**
* @param{email} email
* @param{file} file
* @param{record} record
*/
 (email, file, record,search,XLSX,runtime) => {
     /**
      * Defines the function that is executed at the beginning of the map/reduce process and generates the input data.
      * @param {Object} inputContext
      * @param {boolean} inputContext.isRestarted - Indicates whether the current invocation of this function is the first
      *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
      * @param {Object} inputContext.ObjectRef - Object that references the input data
      * @typedef {Object} ObjectRef
      * @property {string|number} ObjectRef.id - Internal ID of the record instance that contains the input data
      * @property {string} ObjectRef.type - Type of the record instance that contains the input data
      * @returns {Array|Object|Search|ObjectRef|File|Query} The input data to use in the map/reduce process
      * @since 2015.2
      */
     //Top variables modificado por saul navarro el 12/09/22
     let journalid
     let subsidiary_id
     let unitstype_id
     let postingperiod_id
     let entity_id
     let contrato_id
     let department_id
     let class_id
     let location_id

     const getInputData = (inputContext) => {

         const contentfromget = JSON.parse(runtime.getCurrentScript().getParameter({ name: 'custscript_sk_mr_idvaluejournal' }));
         documentId=contentfromget.idxls;
         folderId=contentfromget.folderselec


    var obejson=excelFileToJson(documentId)
    var numinv=0

    obejson[0].forEach(element => {
        if (element.externalid) {
            numinv++
        }
    });
var arreglimto=[]

for (let i = 0; i < numinv; i++) {
    arreglimto.push({
        cabecera:{},
        lines:[]
    })
} 
     var flag1=0
     obejson[0].forEach(element => {
         if (element.externalid && flag1<numinv) {
             arreglimto[flag1].cabecera={
                externalid:element.externalid||null,
                tranId:element.tranId||null,
                subsidiary:element.subsidiary||null,
                unitstype:element.unitstype ||null,
                postingperiod:element.postingperiod||null,
                tranDate:element.tranDate? element.tranDate: "",
                reversalDate:element.reversalDate? element.reversalDate: ""
             }
             arreglimto[flag1].lines.push({
                journalItemLine_accountRef:element.journalItemLine_accountRef || null,
                journalItemLine_Amount:element.journalItemLine_Amount || null,
                journalItemLine_memo:element.journalItemLine_memo || null,
                custcol_skan_nota2:element.custcol_skan_nota2 || null,
                journalItemLine_entityRef:element.journalItemLine_entityRef || null,
                custcol_skan_contrato2:element.custcol_skan_contrato2 || null,
                journalItemLine_departmentRef:element.journalItemLine_departmentRef || null,
                journalItemLine_classRef:element.journalItemLine_classRef || null,
                journalItemLine_locationRef:element.journalItemLine_locationRef || null,
             })
             flag1++
         }else{    
             var newindex=flag1-1
             arreglimto[newindex].lines.push({
                journalItemLine_accountRef:element.journalItemLine_accountRef || null,
                journalItemLine_Amount:element.journalItemLine_Amount || null,
                journalItemLine_memo:element.journalItemLine_memo || null,
                custcol_skan_nota2:element.custcol_skan_nota2 || null,
                journalItemLine_entityRef:element.journalItemLine_entityRef || null,
                custcol_skan_contrato2:element.custcol_skan_contrato2 || null,
                journalItemLine_departmentRef:element.journalItemLine_departmentRef || null,
                journalItemLine_classRef:element.journalItemLine_classRef || null,
                journalItemLine_locationRef:element.journalItemLine_locationRef || null,
             })
         }
     });
         return arreglimto
     }

     /**
      * Defines the function that is executed when the map entry point is triggered. This entry point is triggered automatically
      * when the associated getInputData stage is complete. This function is applied to each key-value pair in the provided
      * context.
      * @param {Object} mapContext - Data collection containing the key-value pairs to process in the map stage. This parameter
      *     is provided automatically based on the results of the getInputData stage.
      * @param {Iterator} mapContext.errors - Serialized errors that were thrown during previous attempts to execute the map
      *     function on the current key-value pair
      * @param {number} mapContext.executionNo - Number of times the map function has been executed on the current key-value
      *     pair
      * @param {boolean} mapContext.isRestarted - Indicates whether the current invocation of this function is the first
      *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
      * @param {string} mapContext.key - Key to be processed during the map stage
      * @param {string} mapContext.value - Value to be processed during the map stage
      * @since 2015.2
      */

     const map = (mapContext) => {
         var datos=JSON.parse(mapContext.value)
        
        //#region Cabecera
         let externalid=datos.cabecera.externalid //hecha la busqueda del external id
         let tranId=datos.cabecera.tranId //No se usa el tranid
         let subsidiary_search="Parent Company : "+datos.cabecera.subsidiary //Cadena para buscar subsidiary
         
         //#region  C .- Subsidiary
         try {
            var subsidiarySearchObj = search.create({
                type: "subsidiary",
                filters:
                [
                   ["name","is",subsidiary_search]
                ],
                columns:
                [
                 search_idsub=search.createColumn({name: "internalid", label: "Internal ID"})
                ]
             });
             var searchResultCount = subsidiarySearchObj.runPaged().count;
             subsidiarySearchObj.run().each(function(result){
                subsidiary_id=result.getValue(search_idsub)
                return true;
             });
         } catch (error) {
            log.debug("Error en la busqueda subsidiaria", error.message)
         }
         //#endregion 
         
         //#region  D.-unitstype
         let unitstype = datos.cabecera.unitstype
         try {
          
            var unitstypeSearchObj = search.create({
                type: "unitstype",
                filters:
                [
                   ["name","is",unitstype]
                ],
                columns:
                [
                 search_unitstype=  search.createColumn({name: "internalid", label: "Internal ID"})
                ]
             });
             var searchResultCount = unitstypeSearchObj.runPaged().count;
             unitstypeSearchObj.run().each(function(result){
                unitstype_id=result.getValue(search_unitstype)
                return true;
             });

         } catch (error) {
            unitstype_id=null
            log.debug("Error en la busqueda unitstype", error.message)
         }
         //#endregion 
         //#region E.- Posting period
         let postingperiod=datos.cabecera.postingperiod
         try {
          
            var accountingperiodSearchObj = search.create({
                type: "accountingperiod",
                filters:
                [
                   ["periodname","is",postingperiod]
                ],
                columns:
                [
                   search_postp= search.createColumn({name: "internalid", label: "Internal ID"})
                ]
             });
             var searchResultCount = accountingperiodSearchObj.runPaged().count;
             accountingperiodSearchObj.run().each(function(result){
                postingperiod_id = result.getValue(search_postp)
                return true;
             });
         } catch (error) {
            postingperiod_id=null
            log.debug("Error en la busqueda posting period", error.message)
         }
         //#endregion
         log.debug(datos.cabecera.tranDate)
         let tranDate=transformdate(datos.cabecera.tranDate)
         /* let reversalDate=formatDatejs(datos.cabecera.reversalDate) */
        //#endregion 



         if (externalid != '' && externalid != null) {
     try {
         var transactionSearchObj = search.create({
             type: "transaction",
             filters:
                 [
                     ["recordtype", "is", record.Type.JOURNAL_ENTRY],
                     "AND",
                     ["mainline", "is", "T"],
                     "AND",
                     ["externalid", "is", externalid]
                 ],
             columns:
                 [
                     search_invoice = search.createColumn({ name: "internalid", label: "Internal ID" })
                 ]
         });
         var searchResultCount = transactionSearchObj.runPaged().count;
             if (searchResultCount>0) {
                     transactionSearchObj.run().each(function (result) {
                     journalid = result.getValue(search_invoice);
                     return true;
                 });
             } else {
                 journalid=''
             }
     } catch (error) {
         log.debug("Ta fallando", error.message)
     }
          
         } else {
             log.debug( 'El campo externalid es obligatorio.')
         }
         
         log.debug("Antes de crear o cargar el journal")

try {
 if (journalid == '') {
     var invObj=record.create({
         type: record.Type.STATISTICAL_JOURNAL_ENTRY,
         isDynamic: true
     })
     invObj.setValue({
         fieldId:"externalid",
         value:externalid
     }).setValue({
         fieldId:"subsidiary",
         value:subsidiary_id
     })
   } else {
     var invObj=record.load({
         type: record.Type.STATISTICAL_JOURNAL_ENTRY,
         id: journalid,
         isDynamic: true,
     })
   }

     invObj.setValue({fieldId:"tranId",value:tranId})
     invObj.setValue({fieldId:"unitstype",value:unitstype_id})    
     invObj.setValue({fieldId:"postingperiod",value:postingperiod_id})
     
     invObj.setValue({fieldId:"trandate",value:tranDate})
     /* invObj.setValue({fieldId:"custbody_fam_jrn_reversal_date", value:reversalDate})      */
     
   if(journalid == ''){
    datos.lines.forEach(line => {

        let journalItemLine_accountRef= line.journalItemLine_accountRef
        let journalItemLine_Amount= line.journalItemLine_Amount
        let journalItemLine_memo= line.journalItemLine_memo
        let journalItemLine_custcol_skan_nota2= line.custcol_skan_nota2
        let journalItemLine_entityRef= line.journalItemLine_entityRef
        let journalItemLine_custcol_skan_contrato2= line.custcol_skan_contrato2
        let journalItemLine_departmentRef= line.journalItemLine_departmentRef
        let journalItemLine_classRef= line.journalItemLine_classRef
        let journalItemLine_locationRef= line.journalItemLine_locationRef

        log.debug('Ya empieza la búsqueda')
        //#region Busquedas nivel line

       //JIL ACCOUNT ID
        try {
           var accountSearchObj = search.create({
               type: "account",
               filters:
               [
                  ["displayname","contains",journalItemLine_accountRef]
               ],
               columns:
               [
               search_idacc=search.createColumn({name: "internalid", label: "Internal ID"})
               ]
            });
            var searchResultCount = accountSearchObj.runPaged().count;
            log.debug("accountSearchObj result count",searchResultCount);
            accountSearchObj.run().each(function(result){
               jil_account_id=result.getValue(search_idacc)
               return true;
            });
        } catch (error) {
           jil_account_id=''
           log.debug("Error busqueda cuenta item",error.message)
        }


        try {
           var customerSearchObj = search.create({
               type: "customer",
               filters:
               [
                  ["externalid","is",journalItemLine_entityRef]
               ],
               columns:
               [
                  search_entity=search.createColumn({name: "internalid",label: "Internal ID"}),
               ]
            });
            var searchResultCount = customerSearchObj.runPaged().count;
            log.debug("customerSearchObj result count",searchResultCount);
            customerSearchObj.run().each(function(result){
               entity_id=result.getValue(search_entity)
               return true;
            });
        } catch (error) {
           entity_id=''
           log.debug("Error recuperando id de cliente",)
        }
        try {
           var customrecord_skan_contratosSearchObj = search.create({
               type: "customrecord_skan_contratos",
               filters:
               [
                  ["name","is",journalItemLine_custcol_skan_contrato2]
               ],
               columns:
               [
                search_contrato=  search.createColumn({name: "internalid", label: "Internal ID"}),

               ]
            });
            var searchResultCount = customrecord_skan_contratosSearchObj.runPaged().count;
            customrecord_skan_contratosSearchObj.run().each(function(result){
               contrato_id=result.getValue(search_contrato)
               return true;
            });
        } catch (error) {
           contrato_id=''
           log.debug("Error recuperando id de cliente",)
        }

        //Department
        try {
           var departmentSearchObj = search.create({
               type: "department",
               filters:
               [
                  ["name","is",journalItemLine_departmentRef]
               ],
               columns:
               [
                search_depart= search.createColumn({name: "internalid", label: "Internal ID"})

               ]
            });
            var searchResultCount = departmentSearchObj.runPaged().count;
            log.debug("departmentSearchObj result count",searchResultCount);
            departmentSearchObj.run().each(function(result){
               department_id=result.getValue(search_depart)
               return true;
            });
           
        } catch (error) {
           department_id=''
           log.debug("fallo en busqueda del departamento",error.message);
       }
       
       //Class
       try {
           var classificationSearchObj = search.create({
               type: "classification",
               filters:
               [
                   ["name","is",journalItemLine_classRef]
               ],
               columns:
               [
                   search.createColumn({
                       name: "name",
                       sort: search.Sort.ASC,
                       label: "Name"
                   }),
                   search_class= search.createColumn({name: "internalid", label: "Internal ID"})
               ]
           });
           var searchResultCount = classificationSearchObj.runPaged().count;
           log.debug("classificationSearchObj result count",searchResultCount);
           classificationSearchObj.run().each(function(result){
               class_id=result.getValue(search_class)
               
               return true;
           });
           
       } catch (error) {
           class_id=''
           log.debug("fallo en busqueda de la clase",error.message);
       }   
       //Location
       try {
           var locationSearchObj = search.create({
               type: "location",
               filters:
               [
                   ["name","is",journalItemLine_locationRef]
               ],
               columns:
               [
                search_location=search.createColumn({name: "internalid", label: "Internal ID"})
               ]
           });
           var searchResultCount = locationSearchObj.runPaged().count;
           log.debug("locationSearchObj result count",searchResultCount);
           locationSearchObj.run().each(function(result){
               location_id= result.getValue(search_location)
               return true;
           });
           
           
       } catch (error) {
           location_id= ''
           log.debug("fallo en busqueda de location",error.message);
           
       }

        //#endregion

        log.debug("jil_account_id",jil_account_id)
        log.debug("objeto",invObj)

        invObj.setCurrentSublistValue({
            sublistId:"line",
            fieldId:"account",
            value:jil_account_id
        })
        invObj.setCurrentSublistValue({
            sublistId:"line",
            fieldId:"debit",
            value:journalItemLine_Amount 
        }).setCurrentSublistValue({
            sublistId:"line",
            fieldId:"memo",
            value:journalItemLine_memo 
        }).setCurrentSublistValue({
            sublistId:"line",
            fieldId:"custcol_skan_nota2",
            value:journalItemLine_custcol_skan_nota2 
        }).setCurrentSublistValue({
           sublistId:"line",
           fieldId:"entity",
           value:entity_id
       }).setCurrentSublistValue({
           sublistId:"line",
           fieldId:"custcol_skan_contrato2",
           value:contrato_id
       }).setCurrentSublistValue({
            sublistId:"line",
            fieldId:"department",
            value:department_id 
        }).setCurrentSublistValue({
            sublistId:"line",
            fieldId:"class",
            value:class_id 
        }).setCurrentSublistValue({
            sublistId:"line",
            fieldId:"location",
            value:location_id 
        }).commitLine({
            sublistId: "line",
        })
    });
   }else{
         datos.lines.forEach(function (line, index) {
            log.debug("Posicion en array",index)
         let journalItemLine_accountRef= line.journalItemLine_accountRef
         let journalItemLine_Amount= line.journalItemLine_Amount
         let journalItemLine_memo= line.journalItemLine_memo
         let journalItemLine_custcol_skan_nota2= line.custcol_skan_nota2
         let journalItemLine_entityRef= line.journalItemLine_entityRef
         let journalItemLine_custcol_skan_contrato2= line.custcol_skan_contrato2
         let journalItemLine_departmentRef= line.journalItemLine_departmentRef
         let journalItemLine_classRef= line.journalItemLine_classRef
         let journalItemLine_locationRef= line.journalItemLine_locationRef

         log.debug('Ya empieza la búsqueda')
         //#region Busquedas nivel line

        //JIL ACCOUNT ID
         try {
            var accountSearchObj = search.create({
                type: "account",
                filters:
                [
                   ["displayname","contains",journalItemLine_accountRef]
                ],
                columns:
                [
                search_idacc=search.createColumn({name: "internalid", label: "Internal ID"})
                ]
             });
             var searchResultCount = accountSearchObj.runPaged().count;
             log.debug("accountSearchObj result count",searchResultCount);
             accountSearchObj.run().each(function(result){
                jil_account_id=result.getValue(search_idacc)
                return true;
             });
         } catch (error) {
            jil_account_id=''
            log.debug("Error busqueda cuenta item",error.message)
         }


         try {
            var customerSearchObj = search.create({
                type: "customer",
                filters:
                [
                   ["externalid","is",journalItemLine_entityRef]
                ],
                columns:
                [
                   search_entity=search.createColumn({name: "internalid",label: "Internal ID"}),
                ]
             });
             var searchResultCount = customerSearchObj.runPaged().count;
             log.debug("customerSearchObj result count",searchResultCount);
             customerSearchObj.run().each(function(result){
                entity_id=result.getValue(search_entity)
                return true;
             });
         } catch (error) {
            entity_id=''
            log.debug("Error recuperando id de cliente",)
         }
         try {
            var customrecord_skan_contratosSearchObj = search.create({
                type: "customrecord_skan_contratos",
                filters:
                [
                   ["name","is",journalItemLine_custcol_skan_contrato2]
                ],
                columns:
                [
                 search_contrato=  search.createColumn({name: "internalid", label: "Internal ID"}),

                ]
             });
             var searchResultCount = customrecord_skan_contratosSearchObj.runPaged().count;
             customrecord_skan_contratosSearchObj.run().each(function(result){
                contrato_id=result.getValue(search_contrato)
                return true;
             });
         } catch (error) {
            contrato_id=''
            log.debug("Error recuperando id de cliente",)
         }

         //Department
         try {
            log.debug("DEPARTAMENTO",journalItemLine_departmentRef)
            if (journalItemLine_departmentRef) {
             
            var departmentSearchObj = search.create({
                type: "department",
                filters:
                [
                   ["name","is",journalItemLine_departmentRef]
                ],
                columns:
                [
                 search_depart= search.createColumn({name: "internalid", label: "Internal ID"})

                ]
             });
             var searchResultCount = departmentSearchObj.runPaged().count;
             log.debug("departmentSearchObj result count",searchResultCount);
             departmentSearchObj.run().each(function(result){
                department_id=result.getValue(search_depart)
                return true;
             });   
            }
            else{
                department_id=''
            }
            
         } catch (error) {
            department_id=''
            log.debug("fallo en busqueda del departamento",error.message);
        }
        
        //Class
        try {
            var classificationSearchObj = search.create({
                type: "classification",
                filters:
                [
                    ["name","is",journalItemLine_classRef]
                ],
                columns:
                [
                    search.createColumn({
                        name: "name",
                        sort: search.Sort.ASC,
                        label: "Name"
                    }),
                    search_class= search.createColumn({name: "internalid", label: "Internal ID"})
                ]
            });
            var searchResultCount = classificationSearchObj.runPaged().count;
            log.debug("classificationSearchObj result count",searchResultCount);
            classificationSearchObj.run().each(function(result){
                class_id=result.getValue(search_class)
                
                return true;
            });
            
        } catch (error) {
            class_id=''
            log.debug("fallo en busqueda de la clase",error.message);
        }   
        //Location
        try {
            var locationSearchObj = search.create({
                type: "location",
                filters:
                [
                    ["name","is",journalItemLine_locationRef]
                ],
                columns:
                [
                 search_location=search.createColumn({name: "internalid", label: "Internal ID"})
                ]
            });
            var searchResultCount = locationSearchObj.runPaged().count;
            log.debug("locationSearchObj result count",searchResultCount);
            locationSearchObj.run().each(function(result){
                location_id= result.getValue(search_location)
                return true;
            });
            
            
        } catch (error) {
            location_id= ''
            log.debug("fallo en busqueda de location",error.message);
            
        }

         //#endregion


         let itemcount = invObj.getLineCount({
            sublistId: 'line'
        });

        if (index < itemcount) {
            invObj.selectLine({
                sublistId: 'line',
                line: index
            })
         invObj.setCurrentSublistValue({
             sublistId:"line",
             fieldId:"account",
             value:jil_account_id
         })
         invObj.setCurrentSublistValue({
             sublistId:"line",
             fieldId:"debit",
             value:journalItemLine_Amount 
         }).setCurrentSublistValue({
             sublistId:"line",
             fieldId:"memo",
             value:journalItemLine_memo 
         }).setCurrentSublistValue({
             sublistId:"line",
             fieldId:"custcol_skan_nota2",
             value:journalItemLine_custcol_skan_nota2 
         }).setCurrentSublistValue({
            sublistId:"line",
            fieldId:"entity",
            value:entity_id
        }).setCurrentSublistValue({
            sublistId:"line",
            fieldId:"custcol_skan_contrato2",
            value:contrato_id
        }).setCurrentSublistValue({
             sublistId:"line",
             fieldId:"department",
             value:department_id 
         }).setCurrentSublistValue({
             sublistId:"line",
             fieldId:"class",
             value:class_id 
         }).setCurrentSublistValue({
             sublistId:"line",
             fieldId:"location",
             value:location_id 
         }).commitLine({
             sublistId: "line",
         })

         log.debug('commit','commit realizado')

        }
     });
   }



} catch (error) {
 log.debug("Error en la carga/actualización",error.message)
 log.debug(idObj)
}

        try {
         let idObj=invObj.save({
             ignoreMandatoryFields: true
         })
         log.debug("Jala el journal",idObj)
        } catch (error) {
            log.debug("Falló la journal",error)
         
        }
     }

     /**
      * Defines the function that is executed when the reduce entry point is triggered. This entry point is triggered
      * automatically when the associated map stage is complete. This function is applied to each group in the provided context.
      * @param {Object} reduceContext - Data collection containing the groups to process in the reduce stage. This parameter is
      *     provided automatically based on the results of the map stage.
      * @param {Iterator} reduceContext.errors - Serialized errors that were thrown during previous attempts to execute the
      *     reduce function on the current group
      * @param {number} reduceContext.executionNo - Number of times the reduce function has been executed on the current group
      * @param {boolean} reduceContext.isRestarted - Indicates whether the current invocation of this function is the first
      *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
      * @param {string} reduceContext.key - Key to be processed during the reduce stage
      * @param {List<String>} reduceContext.values - All values associated with a unique key that was passed to the reduce stage
      *     for processing
      * @since 2015.2
      */
     const reduce = (reduceContext) => {

     }


     /**
      * Defines the function that is executed when the summarize entry point is triggered. This entry point is triggered
      * automatically when the associated reduce stage is complete. This function is applied to the entire result set.
      * @param {Object} summaryContext - Statistics about the execution of a map/reduce script
      * @param {number} summaryContext.concurrency - Maximum concurrency number when executing parallel tasks for the map/reduce
      *     script
      * @param {Date} summaryContext.dateCreated - The date and time when the map/reduce script began running
      * @param {boolean} summaryContext.isRestarted - Indicates whether the current invocation of this function is the first
      *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
      * @param {Iterator} summaryContext.output - Serialized keys and values that were saved as output during the reduce stage
      * @param {number} summaryContext.seconds - Total seconds elapsed when running the map/reduce script
      * @param {number} summaryContext.usage - Total number of governance usage units consumed when running the map/reduce
      *     script
      * @param {number} summaryContext.yields - Total number of yields when running the map/reduce script
      * @param {Object} summaryContext.inputSummary - Statistics about the input stage
      * @param {Object} summaryContext.mapSummary - Statistics about the map stage
      * @param {Object} summaryContext.reduceSummary - Statistics about the reduce stage
      * @since 2015.2
      */
     const summarize = (summaryContext) => {
         const contentfromget = JSON.parse(runtime.getCurrentScript().getParameter({ name: 'custscript_sk_mr_idvaluejournal' }));
         fileId=contentfromget.idxls
         folderId=contentfromget.folderselec
 try {
 
     let fileObj = file.load({
         id: fileId
     });
 /*                 folders={
         cuentas:2313,
         nomina:2310,
         siniestros:2070,
         inversiones:2316
     } */
 
 if (folderId===2313){
     fileObj.folder = 2314;
 } else if(folderId===2310){
     fileObj.folder = 2311;
 }else if(folderId===2070){
     fileObj.folder = 2071;
 }else if(folderId===2316){
     fileObj.folder = 2317;                
 }
 fileObj.save();
 log.debug("SE GUARDÓ EL DOCUMENTO")
 } catch (error) {
     
     log.debug("Fallo en: ",error.message)
 }
     }

     //Function Area
     function excelFileToJson(fileId, headers){
         var returnData = [];
         var excelFile = file.load({
           id: fileId
         });
         
         var workbook = XLSX.read(excelFile.getContents(), {type: 'base64'});
         for (var sn in workbook.SheetNames) {
           var sheet = workbook.Sheets[workbook.SheetNames[sn]];
           returnData.push(isEmpty(headers) || isEmpty(headers[workbook.SheetNames[sn]]) ? XLSX.utils.sheet_to_json(sheet) : XLSX.utils.sheet_to_json(sheet, headers[workbook.SheetNames[sn]]));
         }
         return returnData;
      }

     function isEmpty(value){
     if (value == undefined || value == null)
       return true;
     if (util.isNumber(value) || util.isBoolean(value) || util.isDate(value) || util.isFunction(value))
       return false;
     if (util.isString(value))
       return (value.length == 0) ? true : false;
     return (Object.keys(value).length == 0) ? true : false;
   }
   function transformdate(vardate){
       /* let a=vardate.slice(1,11) */
       let a=vardate
       var a1=a.split("/");
       var fecha=new Date(a1[1]+"/"+a1[0]+"/"+a1[2]);
       log.debug("Fechas",fecha)
     return fecha
  }
  


function formatDatejs(serial){
    
    var fechacorrecta=new Date(Math.round((serial - 25569)*86400*1000));
    var la_fecha={
        fulldate:fechacorrecta.getDate(),
        anio_solo:fechacorrecta.getYear(),
        dia_solo:fechacorrecta.getMonth(),
        mes_solo:fechacorrecta.getDay(),
    }
    return fechacorrecta
     
}

     return {getInputData, map, reduce, summarize}

 });
