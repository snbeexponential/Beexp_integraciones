/**
 * @author saul.navarro@beexponential.com.mx
 * @Name sk_rl_dev02_movcuentas.js
 * @description Integración 1 de movimiento de cuentas
 * @NApiVersion 2.1
 * @NScriptType Restlet
 * @NAmdConfig ../../excel_module/sk_sc_excel_conf.json
 */


 define(['N/record','N/search','N/file',"xlsx","N/util","N/format"], function (record,search,file,XLSX,util,format) {

    const response = {
        code: 200,
        message: "",
        result: []
    };
     //Funcion que crea un nuevo registro <CUSTOMER> a partir de los parametros de la solicitud
     function get (contexturl){
        var id=contexturl.id
        /* var f = file.load({id:"SuiteScripts/Integracion/BE02_movimientodecuentas/invoicetemplate/InvoiceTemplateOperadora_1.xlsx"}); */
        var obejson=excelFileToJson(id)
      
       
        var numinv=0
        
       obejson[0].forEach(element => {
            if (element.externalid) {
                numinv++}
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
                    customer:element.customer||null,
                    trandate:element.trandate? new Date(element.trandate) : "",
                    invoicestatus:element.invoicestatus||null,
                    otherrefnum:element.otherrefnum||null,
                    memo:element.memo||null,
                    salesrep:element.salesrep||null,
                    partner:element.partner||null,
                    department:element.department||null,
                    class:element.class||null,
                    location:element.location||null,
                    discount_discountitem:element.discountItem||null,
                    discount_discountrate:element.discountrate||null
                }

                arreglimto[flag1].lines.push({
                    itemLine_item:element.itemLine_item||null,
                    itemLine_quantity:element.itemLine_quantity||null,
                    itemLine_units:element.itemLine_units||null,
                    itemLine_salesPrice:element.itemLine_salesPrice||null,
                    itemLine_amount:element.itemLine_amount||null,
                    itemLine_description:element.itemLine_description||null,
                    itemLine_isTaxable:element.itemLine_isTaxable||null,
                    itemLine_priceLevel:element.itemLine_priceLevel||null,
                    itemLine_department:element.itemLine_department||null,
                    itemLine_class:element.itemLine_class||null,
                    itemLine_location:element.itemLine_location||null,
                    itemLine_skan_contrato:element.itemLine_skan_contrato||null,
                    terms:element.terms||null
                })
                flag1++
            }else{    
                var newindex=flag1-1
                arreglimto[newindex].lines.push({
                    itemLine_item:element.itemLine_item||null,
                    itemLine_quantity:element.itemLine_quantity||null,
                    itemLine_units:element.itemLine_units||null,
                    itemLine_salesPrice:element.itemLine_salesPrice||null,
                    itemLine_amount:element.itemLine_amount||null,
                    itemLine_description:element.itemLine_description||null,
                    itemLine_isTaxable:element.itemLine_isTaxable||null,
                    itemLine_priceLevel:element.itemLine_priceLevel||null,
                    itemLine_department:element.itemLine_department||null,
                    itemLine_class:element.itemLine_class||null,
                    itemLine_location:element.itemLine_location||null,
                    itemLine_skan_contrato:element.itemLine_skan_contrato||null,
                    terms:element.terms||null
                })
            }
        });
        var arrrinvoice=createInvoice(arreglimto)


        return arrrinvoice
    }
    

     function post(context) {
         
         var fileObj = record.create({
            type: record.Type.INVOICE,
            isDynamic: true
         })
            return fileObj
    
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

     function createInvoice(arrinv) {
        var cabecera =[]
        arrinv.forEach(element2 => {
        let externalid=element2.cabecera.externalid
        let tranId=element2.cabecera.tranId
        let customer=element2.cabecera.customer
        let trandate=element2.cabecera.trandate 
        let invoicestatus=element2.cabecera.invoicestatus
        let otherrefnum=element2.cabecera.otherrefnum
        let memo=element2.cabecera.memo
        let salesrep=element2.cabecera.salesrep
        let partner=element2.cabecera.partner
        let department=element2.cabecera.department
        let inv_class=element2.cabecera.class
        let location=element2.cabecera.location
        let discountItem=element2.cabecera.discount_discountitem
        let discountrate=element2.cabecera.discount_discountrate
        var invObj=record.create({
            type: record.Type.INVOICE,
            isDynamic: true
        })/* .setValue({
            fieldId:"",
            value:externalid
        }) *//* .setValue({
            fieldId:"entity",
            value:tranId
        }) */.setValue({
            fieldId:"entity",
            value:customer
        }).setValue({
            fieldId:"trandate",
            value:trandate
        }).setValue({
            fieldId:"approvalstatus",
            value:(invoicestatus=="cumplimiento pendiente")? 1: 2
        })/* .setValue({
            fieldId:"",
            value:otherrefnum
        }) */.setValue({
            fieldId:"memo",
            value:memo
        }).setValue({
            fieldId:"salesrep",
            value:salesrep
        })/* .setValue({
            fieldId:"",
            value:partner
        }) */.setValue({
            fieldId:"department",
            value:department
        }).setValue({
            fieldId:"class",
            value:inv_class
        }).setValue({
            fieldId:"location",
            value:location
        }).setValue({
            fieldId:"discountitem",
            value:discountItem
        }).setValue({
            fieldId:"discountrate",
            value:discountrate
        })


        
        element2.lines.forEach(line => {
            
            let temLine_item= line.itemLine_item
            let temLine_quantity= line.itemLine_quantity
            let temLine_units= line.itemLine_units
            let temLine_salesPrice= line.itemLine_salesPrice
            let temLine_amount= line.itemLine_amount
            let temLine_description= line.itemLine_description
            let temLine_isTaxable= line.itemLine_isTaxable
            let temLine_priceLevel= line.itemLine_priceLevel
            let temLine_department= line.itemLine_department
            let temLine_class= line.itemLine_class
            let temLine_location= line.itemLine_location
            let temLine_skan_contrato= line.itemLine_skan_contrato
            invObj.setCurrentSublistValue({
                sublistId:"item",
                fieldId:"item",
                value:temLine_item 
            }).setCurrentSublistValue({
                sublistId:"item",
                fieldId:"quantity",
                value:temLine_quantity 
            }).setCurrentSublistValue({
                sublistId:"item",
                fieldId:"units",
                value:temLine_units 
            }).setCurrentSublistValue({
                sublistId:"item",
                fieldId:"amount",
                value:temLine_amount 
            }).setCurrentSublistValue({
                sublistId:"item",
                fieldId:"",
                value:temLine_description 
            }).setCurrentSublistValue({
                sublistId:"item",
                fieldId:"pricelevels",
                value:temLine_priceLevel 
            }).setCurrentSublistValue({
                sublistId:"item",
                fieldId:"department",
                value:temLine_department 
            }).setCurrentSublistValue({
                sublistId:"item",
                fieldId:"class",
                value:temLine_class 
            }).commitLine({
                sublistId: "item",
            })
            log.debug("haciendo commit")
            /* .setCurrentSublistValue({
                sublistId:"item",
                fieldId:"amount",
                value:temLine_salesPrice 
            }) */
            /* .setCurrentSublistValue({
                sublistId:"item",
                fieldId:"",
                value:temLine_isTaxable 
            }) */
/* .setCurrentSublistValue({
                sublistId:"item",
                fieldId:"",
                value:temLine_location 
            }) *//* .setCurrentSublistValue({
                sublistId:"item",
                fieldId:"",
                value:temLine_skan_contrato 
            }) *//* .setCurrentSublistValue({
                sublistId:"item",
                fieldId:"",
                value:terms 
            }) */
        });   
        
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

     return {
         get:get,
         post:post
     };
 });