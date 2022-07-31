/**
 * @author Saul Navarro<saul.navarro@beexponential.com.mx>
 * @Name FA_rl_directions.js
 * @description Script para obtener, crear y actualizar direcciones de clientes en figueacero
 * @file fa_customers.xlsx <URL PENDIENTE>
 * @NApiVersion 2.1
 * @NScriptType Restlet
 */
 define([
    'N/log',
    'N/record',
    '../libs/lib_rest_export',
    '../libs/lib_rest_module',
    'N/runtime',
    "N/search",
    "N/format"
],
function(log, record, jsexport, jsimport, runtime,search,format) {

    const entry_point = {
        get: null,
        post: null,
        put: null
    };
    
    const response = {
        code: 200,
        message: "",
        result:[]
    };
    //Formato de JSON usado en el get
    const directiondata={
        internalid:null,
        addressbook:[{
            addressbookaddress:null
        }]
    }

    entry_point.get = function(request) {         
        try {
            filters = [];
            var id = request.internalid;
            
            if (id) {
              filters.push(["internalidnumber", "equalto", id]);
            }
            else {
              response.message = "Missing fields";
              return response;
            }
    
            var custBookSearchObj = search.create({
                type: "customer",
                filters:[filters],
                columns: [
                   search_address=search.createColumn({name: "addresslabel",label: "Address Label"}),                    
                   search_country=search.createColumn({name: "country", label: "Country"}),
                   search_attention=search.createColumn({name: "attention", label: "Attention"}),
                   search_addresse=search.createColumn({name: "addressee", label: "Addressee"}),
                   search_addrphone=search.createColumn({name: "addressphone", label: "Address Phone"}),
                   search_addr1=search.createColumn({name: "address1", label: "Address 1"}),
                   search_addr2=search.createColumn({name: "address2", label: "Address 2"}),
                   search_city=search.createColumn({name: "city", label: "City"}),
                   search_state=search.createColumn({name: "state", label: "State/Province"}),
                   search_zip=search.createColumn({name: "zipcode", label: "Zip Code"}),
                   search_vatregnumber=search.createColumn({name:"custentity_vat_reg_no", label: "VAT Registration No"}),
                   search_isdefaultshipping=search.createColumn({name:"isdefaultshipping",label:"isdefaultshipping"}),
                   search_isdefaultbilling=search.createColumn({name:"isdefaultbilling",label:"isdefaultbilling"}),
                   search_internalid2=search.createColumn({name: "addressinternalid",label: "Address Internal ID"})
                ],
              });
              var searchResultCount = custBookSearchObj.runPaged().pageRanges;
              var pagedData2 = custBookSearchObj.runPaged({
                  "pa​g​e​S​i​z​e": 1000,
                });
                for (var j = 0; j < pagedData2.pageRanges.length; j++) {
                    var currentPage2 = pagedData2.fetch(j);
                    currentPage2.data.forEach(function (result2) {
                        response.result.push({
                            notedirectiontype:'texto',
                            attention:result2.getValue(search_attention),
                            country:result2.getValue(search_country),
                            addresse:result2.getValue(search_addresse),
                            addrphone:result2.getValue(search_addrphone),
                            addr1:result2.getValue(search_addr1),
                            addr2:result2.getValue(search_addr2),
                            city:result2.getValue(search_city),
                            state:result2.getValue(search_state),
                            zip:result2.getValue(search_zip),
                            vatregnumber:result2.getValue(search_vatregnumber),
                            label:result2.getValue(search_address),
                            defaultshipping:result2.getValue(search_isdefaultshipping),
                            defaultbilling:result2.getValue(search_isdefaultbilling),
                            isresidential:'',
                            internalid:result2.getValue(search_internalid2)
                        }
                        );
                    });
              }
        } catch (error) {
            response.code = 400;
            response.message = error.message;
        }

        
        return response;
    }

    entry_point.post = function(request) {
        directiondata.internalid=request.internalid;
        directiondata.addressbook[0].addressbookaddress=request.addressbook;
        try {
            let fixed_request = JSON.parse(JSON.stringify(directiondata));
            
            if (fixed_request.internalid!=null) {
                createOrUpdateCustomer(fixed_request);
            } else {
                response.code = 400;
                response.message = 'favor de agregar el campo internalid con un valor texto que contenga un id válido de clinete    ';
            }
        } catch (error) {
            log.error('entry_point.post ERROR', error);
            response.code = 400;
            response.message = error;
        }
        return response;
    }

    entry_point.put = (request) => {

            let customerid=request.internalid
            let addresid=request.addressbook.id
            
            var objeRcord = record.load({
                type: record.Type.CUSTOMER,
                id: customerid,
                isDynamic: true,
            })
          
            //variables a editar
            let addr1 = request.addressbook.addr1

            //Seleccionamos y apuntamos
            var itemLineNumber = objeRcord.findSublistLineWithValue({sublistId: "addressbook", fieldId:"internalid", value: addresid })
            
            objeRcord.selectLine({sublistId: 'addressbook',line: itemLineNumber})

            objeRcord.setCurrentSublistValue({sublistId: 'addressbook', fieldId: 'zipcode', value: 91203 })

            
            //Guardamos los cambios
            objeRcord.commitLine({ sublistId: 'addressbook'})
            objeRcord.save();

            return true
    }

    const createOrUpdateCustomer = (fixed_request) => {
        let obj2create = {};
        fixed_request['custentity_fa_created_from'] = runtime.getCurrentScript().id;
        if (fixed_request.internalid) { obj2create["id"] = fixed_request.internalid; }
        obj2create['recordType'] = record.Type.CUSTOMER;
        obj2create['isDynamic'] = true;
        obj2create['ignoreMandatoryFields'] = true;
        obj2create['values'] = fixed_request;

        //Mausquerramienta que servirá mas tarde
        var directions=[];
        var directions2=[];
        var nuevoid=null;
        
        //Creamos un listado del id que tenemos antes de insertar
        var objCustomer1 = record.load({ type: record.Type.CUSTOMER, id: fixed_request.internalid, isDynamic: true });
        var totalLines1 = objCustomer1.getLineCount({ sublistId: 'addressbook' });

        for (let index = 0; index < totalLines1; index++) {
            directions.push({
                addressid: objCustomer1.getSublistValue({ sublistId: 'addressbook', fieldId: 'internalid', line: index })
            })
        }  
        //Ejecutamos la librería (Inserción de los datos)
        let submit = jsimport.submitFieldsJS(obj2create);

        //Tomamos la lista actualizada con el nuevo campo
        var objCustomer2 = record.load({ type: record.Type.CUSTOMER, id: submit.recordId, isDynamic: true });
        var totalLines2 = objCustomer2.getLineCount({ sublistId: 'addressbook' });
        for (let index2 = 0; index2 < totalLines2; index2++) {
            directions2.push({
                addressid: objCustomer2.getSublistValue({ sublistId: 'addressbook', fieldId: 'internalid', line: index2 })                    
            })
        }
        
        
        //Comparamos arreglos de objetos para recuperar el id que recién se ingresó
        for (var i = 0; i < directions2.length; i++) {
            var igual=false;
            for (var j = 0; j < directions.length & !igual; j++) {
                if(directions2[i]['addressid'] == directions[j]['addressid']){
                    igual=true;
                } 
            }
            if(!igual){
                nuevoid=directions2[i]
            }
        }

        //Creamos el result
        response.result = {
            clientid:submit.recordId,
            addresid:nuevoid.addressid
        };

        response.message = submit.msg;
        log.error({ title: 'createOrUpdateCustomer', details: { fixed_request, response } });
        record.submitFields({
            type: record.Type.CUSTOMER,
            id: response.result.clientid,
            values: {
                custentity_fa_request: JSON.stringify(fixed_request),
                custentity_fa_response: response
            },
            options: {
                enableSourcing: false,
                ignoreMandatoryFields: true
            }
        });
    }

    return entry_point;
});