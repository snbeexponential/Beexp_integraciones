/**
 * @author Saul Navarro <saul.navarro@beexponential.com.mx>
 * @Modifciacion
 * @Name nm_rl_customers.js
 * @description Script para la importacion/exportacion de Customers. URL Documentation: https://documenter.getpostman.com/view/17016886/Tzz4SKpF
 * @file fa_customers.xlsx <URL PENDIENTE>
 * @NApiVersion 2.1
 * @NScriptType Restlet
 */
 define([
  'N/log',
  'N/record',
  'N/runtime',
  "N/search",
  "N/format"
],
function(log, record, runtime,search,format) {

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
  entry_point.get = function(request) {         
          var id = request.internalid;
          var customerSearchObj = search.create({
            type: "customer",
            filters:
            [
               ["internalid","anyof",id]
            ],
            columns:
            [
               search.createColumn({
                  name: "entityid",
                  sort: search.Sort.ASC,
                  label: "ID"
               }),
               search.createColumn({name: "altname", label: "Name"}),
               search.createColumn({name: "email", label: "Email"}),
               search.createColumn({name: "address", label: "Address"})
            ]
         });
         var searchResultCount = customerSearchObj.runPaged().count;
         log.debug("customerSearchObj result count",searchResultCount);
         customerSearchObj.run().each(function(result){
          response.result.push({resultado:result})
         });
         const myJSON = JSON.stringify(response);
          return myJSON;
      }

  entry_point.post = function(request) {
      return "post";
  }

  entry_point.put = (request) => {
      return "put";
  }

  return entry_point;
});