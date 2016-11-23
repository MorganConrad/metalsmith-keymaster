module.exports = copyProp;


/**
 * Metalsmith plugin to copy / preserve a property
 
 Possible uses:
 
    - You have existing .md files and template files, but the names of some fields have changed over time
       e.g., if the template now uses {{ userName }} instead of {{ name }}, but you don't want to redo all the YAML
       
       .use(copyProp('name', 'userName')
       
    - You want to preserve contents before the next step processes them.
       e.g., to preserve the raw contents before markdown, add the following before use(markdown())
       
       .use(copyProp('.', 'raw'))
       // then 
       .use(markdown())
       
     - You are lazy and want a quick-and-dirty plugin of your own.
        e.g., to quickly hack your own not-very-smart excerpt plugin:

       .use(copyProp(function(data) {
                       return data.contents.toString().substring(0, 50);
                     },
                     'excerpt'));
                     
  Warning: This does not check if the property already exists, so be careful not to overwrite something you need!
    
 
 * @param  {function or string} from  if a string, get that property
                                      (special, if '.', gets contents.toString())
                                      if a function, call from(fileData, filePath)
 * @param  {string} to                place value derived from from here
 * @return {function}                 the plugin
 */
 
function copyProp(from, to) {

   var fromfn = from;  // guess it's a function
   if (from === '.')
      fromfn = function(obj) { return obj.contents.toString(); }
   else if (typeof from === 'string')
      fromfn = function(obj) { return obj[from]; }

   return function(files, metalsmith, done) {

     Object.keys(files).forEach(function(filePath){
        var data = files[filePath];
        var value = fromfn(data, filePath, metalsmith);
        data[to] = value;
     });

     done();
  };

}
