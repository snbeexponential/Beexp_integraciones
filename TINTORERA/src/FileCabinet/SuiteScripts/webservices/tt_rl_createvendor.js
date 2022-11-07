/**
 * @NApiVersion 2.1
 * @NScriptType Restlet
 */
define(["N/record"], /**
 * @param{record} record
 */
(record) => {
  const response = {
    code: null,
    message: null,
    result: [],
  };
  /**
   * Defines the function that is executed when a GET request is sent to a RESTlet.
   * @param {Object} requestParams - Parameters from HTTP request URL; parameters passed as an Object (for all supported
   *     content types)
   * @returns {string | Object} HTTP response body; returns a string when request Content-Type is 'text/plain'; returns an
   *     Object when request Content-Type is 'application/json' or 'application/xml'
   * @since 2015.2
   */
  const get = (requestParams) => {};

  /**
   * Defines the function that is executed when a PUT request is sent to a RESTlet.
   * @param {string | Object} requestBody - The HTTP request body; request body are passed as a string when request
   *     Content-Type is 'text/plain' or parsed into an Object when request Content-Type is 'application/json' (in which case
   *     the body must be a valid JSON)
   * @returns {string | Object} HTTP response body; returns a string when request Content-Type is 'text/plain'; returns an
   *     Object when request Content-Type is 'application/json' or 'application/xml'
   * @since 2015.2
   */
  const post = (req) => {
    try {
      let companyname = req.companyname;
      let isperson = req.isperson;
      let custentity_mx_rfc = req.custentity_mx_rfc;
      let url = req.url;
      let category = req.category;
      let comments = req.comments;
      let subsidiary = req.subsidiary;
      let email = req.email;
      let phone = req.phone;
      let altphone = req.altphone;
      let ce_email_address_notif = req.custentity_2663_email_address_notif;

      let vendObj = record.create({
        type: record.Type.VENDOR,
        isDynamic: true,
      });

      vendObj.setValue({
        fieldId: "companyname",
        value: companyname,
        ignoreFieldChange: true,
      });
      vendObj.setValue({
        fieldId: "isperson",
        value: isperson == true ? "T" : "F",
        ignoreFieldChange: true,
      });
      vendObj.setValue({
        fieldId: "custentity_mx_rfc",
        value: custentity_mx_rfc,
        ignoreFieldChange: true,
      });
      vendObj.setValue({
        fieldId: "url",
        value: url,
        ignoreFieldChange: true,
      });
      vendObj.setValue({
        fieldId: "category",
        value: category,
        ignoreFieldChange: true,
      });
      vendObj.setValue({
        fieldId: "comments",
        value: comments,
        ignoreFieldChange: true,
      });
      vendObj.setValue({
        fieldId: "subsidiary",
        value: subsidiary,
        ignoreFieldChange: true,
      });
      vendObj.setValue({
        fieldId: "email",
        value: email,
        ignoreFieldChange: true,
      });
      vendObj.setValue({
        fieldId: "phone",
        value: phone,
        ignoreFieldChange: true,
      });
      vendObj.setValue({
        fieldId: "altphone",
        value: altphone,
        ignoreFieldChange: true,
      });
      vendObj.setValue({
        fieldId: "custentity_2663_email_address_notif",
        value: ce_email_address_notif,
        ignoreFieldChange: true,
      });

      if (req.address) {
        //#region
        let etiqueta = req.address.etiqueta || null;
        log.debug("here works x1", etiqueta);
        let isbilling = req.address.isbilling || null;
        let isshiping = req.address.isshiping || null;
        let pais = req.address.country || null;
        let state = req.address.state || null;
        let zip = req.address.zip || null;
        let addressee = req.address.addressee || null;
        let custrecord_streetname = req.address.custrecord_streetname || null;
        let custrecord_streetnum = req.address.custrecord_streetnum || null;

        vendObj.selectNewLine({
          sublistId: "addressbook",
        });
        vendObj.setCurrentSublistValue({
          sublistId: "addressbook",
          fieldId: "defaultbilling",
          value: isbilling == true ? true : false,
          ignoreFieldChange: true,
        });
        vendObj.setCurrentSublistValue({
          sublistId: "addressbook",
          fieldId: "defaultshipping",
          value: isshiping == true ? true : false,
          ignoreFieldChange: true,
        });
        vendObj.setCurrentSublistValue({
          sublistId: "addressbook",
          fieldId: "label",
          value: etiqueta,
          ignoreFieldChange: true,
        });
        log.debug("here works x2");
        //Detalles de la dirección
        var addressSubrecord = vendObj.getCurrentSublistSubrecord({
          sublistId: "addressbook",
          fieldId: "addressbookaddress",
        });
        addressSubrecord.setValue({
          fieldId: "country",
          value: pais,
        });
        addressSubrecord.setValue({
          fieldId: "state",
          value: state,
        });
        addressSubrecord.setValue({
          fieldId: "zip",
          value: zip,
        });
        addressSubrecord.setValue({
          fieldId: "addressee",
          value: addressee,
        });
        addressSubrecord.setValue({
          fieldId: "custrecord_streetname",
          value: custrecord_streetname,
        });
        addressSubrecord.setValue({
          fieldId: "custrecord_streetnum",
          value: custrecord_streetnum,
        });
        vendObj.commitLine({
          sublistId: "addressbook",
        });
      }
      //#endregion

      let idvendor = vendObj.save({
        ignoreMandatoryFields: true,
      });

      let direccionId = obteneridaddress(idvendor);

      response.code = 200;
      response.message = "Se ha creado un vendedor exitosamente";
      response.result.push({
        proveedorid: idvendor,
        direccionId: direccionId,
      });
    } catch (error) {
      response.code = 400;
      response.message = "error en la transacción: " + error.message;
    }
    return response;
  };

  /**
   * Defines the function that is executed when a POST request is sent to a RESTlet.
   * @param {string | Object} requestBody - The HTTP request body; request body is passed as a string when request
   *     Content-Type is 'text/plain' or parsed into an Object when request Content-Type is 'application/json' (in which case
   *     the body must be a valid JSON)
   * @returns {string | Object} HTTP response body; returns a string when request Content-Type is 'text/plain'; returns an
   *     Object when request Content-Type is 'application/json' or 'application/xml'
   * @since 2015.2
   */
  const put = (req) => {
    try {
      let direcciones=[]
      let vendObj;
      let direccionId=null
      let idusuario = req.idusuario;
      if (idusuario) {
        vendObj = record.load({
          type: record.Type.VENDOR,
          id: idusuario,
          isDynamic: true,
        });
      } else {
        response.code = 400;
        response.message = "Favor de enviar un id valido de proveedor";
        return response;
      }

      let companyname = req.companyname;
      let isperson = req.isperson;
      let custentity_mx_rfc = req.custentity_mx_rfc;
      let url = req.url;
      let category = req.category;
      let comments = req.comments;
      let subsidiary = req.subsidiary;
      let email = req.email;
      let phone = req.phone;
      let altphone = req.altphone;
      let ce_email_address_notif = req.custentity_2663_email_address_notif;

      vendObj.setValue({
        fieldId: "companyname",
        value: companyname,
        ignoreFieldChange: true,
      });
      vendObj.setValue({
        fieldId: "isperson",
        value: isperson == true ? "T" : "F",
        ignoreFieldChange: true,
      });
      vendObj.setValue({
        fieldId: "custentity_mx_rfc",
        value: custentity_mx_rfc,
        ignoreFieldChange: true,
      });
      vendObj.setValue({
        fieldId: "url",
        value: url,
        ignoreFieldChange: true,
      });
      vendObj.setValue({
        fieldId: "category",
        value: category,
        ignoreFieldChange: true,
      });
      vendObj.setValue({
        fieldId: "comments",
        value: comments,
        ignoreFieldChange: true,
      });
      vendObj.setValue({
        fieldId: "subsidiary",
        value: subsidiary,
        ignoreFieldChange: true,
      });
      vendObj.setValue({
        fieldId: "email",
        value: email,
        ignoreFieldChange: true,
      });
      vendObj.setValue({
        fieldId: "phone",
        value: phone,
        ignoreFieldChange: true,
      });
      vendObj.setValue({
        fieldId: "altphone",
        value: altphone,
        ignoreFieldChange: true,
      });
      vendObj.setValue({
        fieldId: "custentity_2663_email_address_notif",
        value: ce_email_address_notif,
        ignoreFieldChange: true,
      });
      //Direcciones
      //#region

      if (req.address) {
        direccionId = req.address.idaddress || null;
        let etiqueta = req.address.etiqueta || null;
        let isbilling = req.address.isbilling || null;
        let isshiping = req.address.isshiping || null;
        let pais = req.address.pais || null;
        let state = req.address.state || null;
        let zip = req.address.zip || null;
        let addressee = req.address.addressee || null;
        let custrecord_streetname = req.address.custrecord_streetname || null;
        let custrecord_streetnum = req.address.custrecord_streetnum || null;
        var totalLines1 = vendObj.getLineCount({ sublistId: "addressbook" });
        if (direccionId) {
            
            for (let index = 0; index < totalLines1; index++) {
                
                let internalidedit = vendObj.getSublistValue({
                    sublistId: "addressbook",
                    fieldId: "internalid",
                    line: index,
                });
                direcciones.push({ addressid: internalidedit });

                if (internalidedit===direccionId) {
                    vendObj.selectLine({
                        sublistId: "addressbook",
                        line: index,
                    });
                    vendObj.setCurrentSublistValue({
                        sublistId: "addressbook",
                        fieldId: "label",
                        value: etiqueta,
                        ignoreFieldChange: true,
                    });
                    vendObj.setCurrentSublistValue({
                        sublistId: "addressbook",
                        fieldId: "defaultbilling",
                        value: isbilling == true ? true : false,
                        ignoreFieldChange: true,
                      });
                      vendObj.setCurrentSublistValue({
                        sublistId: "addressbook",
                        fieldId: "defaultshipping",
                        value: isshiping == true ? true : false,
                        ignoreFieldChange: true,
                      });

                      var addressSubrecord = vendObj.getCurrentSublistSubrecord({
                        sublistId: "addressbook",
                        fieldId: "addressbookaddress",
                      });
                      addressSubrecord.setValue({
                        fieldId: "country",
                        value: pais,
                      });
                      addressSubrecord.setValue({
                        fieldId: "state",
                        value: state,
                      });
                      addressSubrecord.setValue({
                        fieldId: "zip",
                        value: zip,
                      });
                      addressSubrecord.setValue({
                        fieldId: "addressee",
                        value: addressee,
                      });
                      addressSubrecord.setValue({
                        fieldId: "custrecord_streetname",
                        value: custrecord_streetname,
                      });
                      addressSubrecord.setValue({
                        fieldId: "custrecord_streetnum",
                        value: custrecord_streetnum,
                      });

                    vendObj.commitLine({
                        sublistId: "addressbook",
                    });
                }
            }
        }else{
            for (let index = 0; index < totalLines1; index++) {
                
                let internalidedit = vendObj.getSublistValue({
                    sublistId: "addressbook",
                    fieldId: "internalid",
                    line: index,
                });
                direcciones.push({ addressid: internalidedit });
            }

            vendObj.selectNewLine({
                sublistId: "addressbook",
              });
              vendObj.setCurrentSublistValue({
                sublistId: "addressbook",
                fieldId: "defaultbilling",
                value: isbilling == true ? true : false,
                ignoreFieldChange: true,
              });
              vendObj.setCurrentSublistValue({
                sublistId: "addressbook",
                fieldId: "defaultshipping",
                value: isshiping == true ? true : false,
                ignoreFieldChange: true,
              });
    
              vendObj.setCurrentSublistValue({
                sublistId: "addressbook",
                fieldId: "label",
                value: etiqueta,
                ignoreFieldChange: true,
              });
              //Detalles de la dirección
              var addressSubrecord = vendObj.getCurrentSublistSubrecord({
                sublistId: "addressbook",
                fieldId: "addressbookaddress",
              });
              addressSubrecord.setValue({
                fieldId: "country",
                value: pais,
              });
              addressSubrecord.setValue({
                fieldId: "state",
                value: state,
              });
              addressSubrecord.setValue({
                fieldId: "zip",
                value: zip,
              });
              addressSubrecord.setValue({
                fieldId: "addressee",
                value: addressee,
              });
              addressSubrecord.setValue({
                fieldId: "custrecord_streetname",
                value: custrecord_streetname,
              });
              addressSubrecord.setValue({
                fieldId: "custrecord_streetnum",
                value: custrecord_streetnum,
              });
    
              vendObj.commitLine({
                sublistId: "addressbook",
              });   
        }
    }
        
        //#endregion
        let idvendor = vendObj.save({
            ignoreMandatoryFields: true,
        });

      if (!direccionId) {
        direccionId = obteneridaddress2(idvendor,direcciones);
      }

      response.code = 200;
      response.message = "Proveedor actualizado exitosamente";
      response.result.push({
        proveedorid: idvendor,
        direccionId: direccionId,
      });

    } catch (error) {
      response.code = 400;
      response.message = "error en la transacción: " + error.message;
    }
    return response;
  };

  /**
   * Defines the function that is executed when a DELETE request is sent to a RESTlet.
   * @param {Object} requestParams - Parameters from HTTP request URL; parameters are passed as an Object (for all supported
   *     content types)
   * @returns {string | Object} HTTP response body; returns a string when request Content-Type is 'text/plain'; returns an
   *     Object when request Content-Type is 'application/json' or 'application/xml'
   * @since 2015.2
   */
  const doDelete = (requestParams) => {};

  //Function area
  function obteneridaddress(vendorid) {
    let direccion;
    let vendObj = record.load({
      type: record.Type.VENDOR,
      id: vendorid,
      isDynamic: true,
    });
    try {
      direccion = vendObj.getSublistValue({
        sublistId: "addressbook",
        fieldId: "internalid",
        line: 0,
      });
    } catch (error) {
      direccion = null;
    }
    log.debug("direccion", direccion);
    return direccion;
  }

  function obteneridaddress2(vendorid,direccion1) {
      let nuevoid;
      let direccion2=[];

      let vendObj = record.load({
        type: record.Type.VENDOR,
        id: vendorid,
        isDynamic: true,
      });
      try {
        let count=vendObj.getLineCount({
            sublistId: "addressbook"
        })
        for (let index= 0; index < count; index++) {
            direccion2.push({
                addressid: vendObj.getSublistValue({ sublistId: 'addressbook', fieldId: 'internalid', line: index })                    
            })
        }


        for (let i = 0; i < direccion2.length; i++) {
            let igual=false;
            for (let j = 0; j < direccion1.length & !igual; j++) {
                if(direccion2[i]['addressid'] == direccion1[j]['addressid']){
                    igual=true;
                } 
            }
            if(!igual){
                nuevoid=direccion2[i].addressid
            }
        }

      } catch (error) {
        nuevoid = null;

      }
    return nuevoid;
  }

  return { get, put, post, delete: doDelete };
});
