
module.exports = keymaster;


/*
 * Metalsmith plugin to copy / preserve a property

 Possible uses:

    - You have existing .md files and template files, but the names of some fields have changed over time
       e.g., if the template now uses {{ userName }} instead of {{ name }}, but you don't want to redo all the YAML

       .use(keymaster('name', 'userName')

    - You want to preserve contents before the next step processes them.
       e.g., to preserve the raw contents before markdown, add the following before use(markdown())

       .use(keymaster('.', 'raw'))
       // then
       .use(markdown())

     - You are lazy and want a quick-and-dirty plugin of your own.
        e.g., to quickly hack your own not-very-smart excerpt plugin:

       .use(keymaster(function(data) {
                       return data.contents.toString().substring(0, 50);
                     },
                     'excerpt'));

  Warning: This does not check if the property already exists, so be careful not to overwrite something you need!



* @param  {required, function or string}  from   if a string, get that property
                                                 (special, if '.', gets contents.toString())
                                                 if a function, call from(fileData, filePath, metalsmith)
 * @param  {required, string}               to   place value derived from from here
 * @param  {string,RegExp or function}  filter   if null, process all files
                                                 if string or RegExp, process only matching filenames
                                                 if a function, only process where filter(filename) returns true

 * @return {function}                            the plugin
*/

function isObject(arg){
   return Object.prototype.toString.call(arg) === '[object Object]';
}

function keymaster(options) {

   // as per https://github.com/Treri/metalsmith-replace/blob/master/lib/replace.js and similar modules
   if (!isObject(options)) {
      throw new Error('metalsmith-keymaster expects object options');
   }

   var from = options.from,
       to = options.to,
       filter = options.filter,
       fromfn,
       filterfn;

   if (typeof from === 'string') {
      fromfn = (from === '.') ?
                    function(obj) { return obj.contents.toString(); } :
                    function(obj) { return obj[from]; };
   }
   else
      fromfn = from;

   filterfn = computeFilterFn(filter);


   return function(files, metalsmith, done) {

     try {
        Object.keys(files).forEach(function(filePath) {
           var data = files[filePath];
           if (filterfn(filePath, data, metalsmith)) {
              var data = files[filePath];
              var value = fromfn(data, filePath, metalsmith);
              data[to] = value;
           }
        });

        done()
     }

     catch(e) {
        done(e);
     }
  };


  /* calculate file filter function */
  function computeFilterFn(filter) {
     if (filter) {
        if (typeof filter === 'string') {
           var regex = new RegExp(filter);
           return function(filePath) { return regex.test(filePath); }
        }
        else if (filter instanceof RegExp)
           return function(filePath) { return filter.test(filePath); }
        else   // must be a function itself
           return filter;
      }
      else  // none, return "pass all"
         return function() { return true; };
   }

}
