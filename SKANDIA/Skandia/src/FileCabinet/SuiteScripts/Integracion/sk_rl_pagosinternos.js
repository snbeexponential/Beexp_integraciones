/**
* @author Carlos Abreu Novelo carlos.abreu@beexponential.com.mx<>
* @Modificacion <>
* @Name sk_rl_pagosinternos.js
* @description Script pagos internos csv
* @file <URL PENDIENTE>
* @NApiVersion 2.1
* @NScriptType Restlet
* @NAmdConfig ../excel_module/sk_sc_excel_conf.json
*/
define(['N/record','N/search','N/file',"xlsx","N/util","N/format"], function (record,search,file,XLSX,util,format) {

    const response = {
        code: 200,
        message: "",
        result: []
    };
    function postRequest(params) {
        log.debug("params", params);
        var dynamicid2 = Object.values(params);
        log.debug("dynamicid2", dynamicid2);
        var name = dynamicid2[0];
        log.debug("name", name);
        var XLS = dynamicid2[1];
        log.debug("XLS", XLS);

        var v_folder = 2064;

        const response = {
            code: 200,
            message: "Archivo Guardado Correctamente",
            result: [idxls]
        };

        // Crear XLS
        var objFileXLS = file.create({
            name: name + ".xls",
            fileType: file.Type.EXCEL,
            contents: XLS,
            encoding: file.Encoding.UTF_8,
            folder: v_folder,
        });
        var idxls = objFileXLS.save();
        response.result.push({
            tipo: name + ".xls",
            id: idxls
        });
        log.debug('idcsv', idxls);

       



        // load file
        var id=idxls
        log.debug("Id documento",id)
        var obejson=excelFileToJson(id)
        log.debug("test 1",obejson)
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

                log.debug("lo que hay desde el inicio",arreglimto[flag1] )
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

        var arrrinvoice=createJournal(arreglimto)
        return arrrinvoice
       




        /*return bodyObj;*/
    }

     
    

     /* function post(context) {
         
         var fileObj = record.create({
            type: record.Type.JOURNAL_ENTRY,
            isDynamic: true
         })
            return fileObj
    
     } */

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
            fieldId:"reversaldefer",
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



     return {
         post: postRequest,
         /* post:post */
     };
 });