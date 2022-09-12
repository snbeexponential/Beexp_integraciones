/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 * @NAmdConfig ../excel_module/sk_sc_excel_conf.json
 */
define(['N/email', 'N/file', 'N/record',"xlsx",'N/runtime'],
    /**
 * @param{email} email
 * @param{file} file
 * @param{record} record
 */
    (email, file, record,XLSX,runtime) => {
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

        const getInputData = (inputContext) => {

            const contentfromget = JSON.parse(runtime.getCurrentScript().getParameter({ name: 'custscript_sk_mr_idvalue' }));
         
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
                    currency :element.currency ||null,
                    exchangerate:element.exchangerate||null,
                    postingperiod:element.postingperiod||null,
                    tranDate:element.tranDate? element.tranDate: "",
                    reversalDate:element.reversalDate? element.reversalDate: "",
                    isDeferred:element.isDeferred||null,
                }
                arreglimto[flag1].lines.push({
                    journalItemLine_accountRef:element.journalItemLine_accountRef || null,
                    journalItemLine_debitAmount:element.journalItemLine_debitAmount || null,
                    journalItemLine_creditAmount:element.journalItemLine_creditAmount || null,
                    journalItemLine_memo:element.journalItemLine_memo || null,
                    journalItemLine_entityRef:element.journalItemLine_entityRef || null,
                    cseg_skan_contrato:element.cseg_skan_contrato || null,
                    journalItemLine_departmentRef:element.journalItemLine_departmentRef || null,
                    journalItemLine_classRef:element.journalItemLine_classRef || null,
                    journalItemLine_locationRef:element.journalItemLine_locationRef || null,
                    journalItemLine_taxCodeRef:element.journalItemLine_taxCodeRef || null,
                    journalItemLine_taxCodeAmount:element.journalItemLine_taxCodeAmount || null
                })
                
                flag1++
            }else{    
                var newindex=flag1-1
                arreglimto[newindex].lines.push({
                    journalItemLine_accountRef:element.journalItemLine_accountRef || null,
                    journalItemLine_debitAmount:element.journalItemLine_debitAmount || null,
                    journalItemLine_creditAmount:element.journalItemLine_creditAmount || null,
                    journalItemLine_memo:element.journalItemLine_memo || null,
                    journalItemLine_entityRef:element.journalItemLine_entityRef || null,
                    cseg_skan_contrato:element.cseg_skan_contrato || null,
                    journalItemLine_departmentRef:element.journalItemLine_departmentRef || null,
                    journalItemLine_classRef:element.journalItemLine_classRef || null,
                    journalItemLine_locationRef:element.journalItemLine_locationRef || null,
                    journalItemLine_taxCodeRef:element.journalItemLine_taxCodeRef || null,
                    journalItemLine_taxCodeAmount:element.journalItemLine_taxCodeAmount || null
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
        



            let externalid=datos.cabecera.externalid
            let tranId=datos.cabecera.tranId
            let subsidiary=datos.cabecera.subsidiary
            let currency=datos.cabecera.currency 
            let exchangerate=datos.cabecera.exchangerate
            let postingperiod=datos.cabecera.postingperiod
            let tranDate=transformdate(datos.cabecera.tranDate)
            let reversalDate=transformdate(datos.cabecera.reversalDate)
            let isDeferred=datos.cabecera.isDeferred=="true"?true:false
            log.debug({
                title: "En el mapITA2",
                details:tranDate
            })

            if (externalid!= null && externalid!= '') {
                
            }


            var invObj=record.create({
                type: record.Type.JOURNAL_ENTRY,
                isDynamic: true
            }).setValue({
                fieldId:"externalid",
                value:externalid
            }).setValue({
                fieldId:"tranId",
                value:tranId
            }).setValue({
                fieldId:"subsidiary",
                value:subsidiary
            }).setValue({
                fieldId:"currency",
                value:currency
            }).setValue({ 
                fieldId:"exchangerate",
                value:exchangerate
            }).setValue({
                fieldId:"postingperiod",
                value:postingperiod
            }).setValue({
                fieldId:"trandate",
                value:new Date(tranDate)
            }).setValue({
                fieldId:"custbody_fam_jrn_reversal_date", 
                value:new Date(tranDate)
            }).setValue({
                fieldId:"c",
                value:isDeferred
            })

            datos.lines.forEach(line => {

                let journalItemLine_accountRef= line.journalItemLine_accountRef
                let journalItemLine_debitAmount= line.journalItemLine_debitAmount
                let journalItemLine_creditAmount= line.journalItemLine_creditAmount
                let journalItemLine_memo= line.journalItemLine_memo
                let journalItemLine_entityRef= line.journalItemLine_entityRef
                let cseg_skan_contrato= line.cseg_skan_contrato
                let journalItemLine_departmentRef= line.journalItemLine_departmentRef
                let journalItemLine_classRef= line.journalItemLine_classRef
                let journalItemLine_locationRef= line.journalItemLine_locationRef
                let journalItemLine_taxCodeRef= line.journalItemLine_taxCodeRef
                let journalItemLine_taxCodeAmount= line.journalItemLine_taxCodeAmount
                invObj.setCurrentSublistValue({
                    sublistId:"line",
                    fieldId:"account",
                    value:journalItemLine_accountRef 
                }).setCurrentSublistValue({
                    sublistId:"line",
                    fieldId:"debit",
                    value:journalItemLine_debitAmount 
                }).setCurrentSublistValue({
                    sublistId:"line",
                    fieldId:"credit",
                    value:journalItemLine_creditAmount 
                }).setCurrentSublistValue({
                    sublistId:"line",
                    fieldId:"memo",
                    value:journalItemLine_memo 
                }).setCurrentSublistValue({
                    sublistId:"line",
                    fieldId:"custcol_skan_contrato2",
                    value:cseg_skan_contrato 
                }).setCurrentSublistValue({
                    sublistId:"line",
                    fieldId:"department",
                    value:journalItemLine_departmentRef 
                }).setCurrentSublistValue({
                    sublistId:"line",
                    fieldId:"class",
                    value:journalItemLine_classRef 
                }).setCurrentSublistValue({
                    sublistId:"line",
                    fieldId:"location",
                    value:journalItemLine_locationRef 
                }).commitLine({
                    sublistId: "line",
                })
            });


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
            const contentfromget = JSON.parse(runtime.getCurrentScript().getParameter({ name: 'custscript_sk_mr_idvalueinv' }));
            log.debug("contentfromget",contentfromget)
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
        let a=vardate.slice(1,11)
        var a1=a.split("/");
        var fecha=new Date(a1[1]+"/"+a1[0]+"/"+a1[2]);
        return fecha
     }
     
     function createJournal(arrinv) {
        var cabecera =[]
        arrinv.forEach(element2 => {
        let externalid=element2.cabecera.externalid
        let tranId=element2.cabecera.tranId
        let subsidiary=element2.cabecera.subsidiary
        let currency=element2.cabecera.currency 
        let exchangerate=element2.cabecera.exchangerate
        let postingperiod=element2.cabecera.postingperiod
        let tranDate=transformdate(element2.cabecera.tranDate)
        let reversalDate=transformdate(element2.cabecera.reversalDate)
        let isDeferred=element2.cabecera.isDeferred=="true"?true:false

        log.debug("campos del heheheheh headaer",({
        tranDate,
        reversalDate
        }))
        /* log.debug("fECHAS2",new Date("15/10/2022")) <-- Esta fecha no es valida*/

        var invObj=record.create({
            type: record.Type.JOURNAL_ENTRY,
            isDynamic: true
        }).setValue({
            fieldId:"externalid",
            value:externalid
        }).setValue({
            fieldId:"tranId",
            value:tranId
        }).setValue({
            fieldId:"subsidiary",
            value:subsidiary
        }).setValue({
            fieldId:"currency",
            value:currency
        }).setValue({ 
            fieldId:"exchangerate",
            value:exchangerate
        }).setValue({
            fieldId:"postingperiod",
            value:postingperiod
        }).setValue({
            fieldId:"trandate",
            value:new Date(tranDate)
        }).setValue({
            fieldId:"custbody_fam_jrn_reversal_date", 
            value:new Date(tranDate)
        }).setValue({
            fieldId:"c",
            value:isDeferred
        })

        log.debug("Paso datos del headers")
        element2.lines.forEach(line => {
            
            let journalItemLine_accountRef= line.journalItemLine_accountRef
            let journalItemLine_debitAmount= line.journalItemLine_debitAmount
            let journalItemLine_creditAmount= line.journalItemLine_creditAmount
            let journalItemLine_memo= line.journalItemLine_memo
            let journalItemLine_entityRef= line.journalItemLine_entityRef
            let cseg_skan_contrato= line.cseg_skan_contrato
            let journalItemLine_departmentRef= line.journalItemLine_departmentRef
            let journalItemLine_classRef= line.journalItemLine_classRef
            let journalItemLine_locationRef= line.journalItemLine_locationRef
            let journalItemLine_taxCodeRef= line.journalItemLine_taxCodeRef
            let journalItemLine_taxCodeAmount= line.journalItemLine_taxCodeAmount

            invObj.setCurrentSublistValue({
                sublistId:"line",
                fieldId:"account",
                value:journalItemLine_accountRef 
            }).setCurrentSublistValue({
                sublistId:"line",
                fieldId:"debit",
                value:journalItemLine_debitAmount 
            }).setCurrentSublistValue({
                sublistId:"line",
                fieldId:"credit",
                value:journalItemLine_creditAmount 
            }).setCurrentSublistValue({
                sublistId:"line",
                fieldId:"memo",
                value:journalItemLine_memo 
            }).setCurrentSublistValue({
                sublistId:"line",
                fieldId:"custcol_skan_contrato2",
                value:cseg_skan_contrato 
            }).setCurrentSublistValue({
                sublistId:"line",
                fieldId:"department",
                value:journalItemLine_departmentRef 
            }).setCurrentSublistValue({
                sublistId:"line",
                fieldId:"class",
                value:journalItemLine_classRef 
            }).setCurrentSublistValue({
                sublistId:"line",
                fieldId:"location",
                value:journalItemLine_locationRef 
            }).commitLine({
                sublistId: "line",
            })
            log.debug("haciendo commit")
        });   
        log.debug("Se agregón un commit")
        let idObj=invObj.save({
            ignoreMandatoryFields: true
        })

        cabecera.push({
            idInvoice:idObj
        })

        log.debug("Se hizo una invoice",cabecera)
    });
    return cabecera
     }

        return {getInputData, map, reduce, summarize}

    });
