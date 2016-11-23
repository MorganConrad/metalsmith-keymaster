# metalsmith-copyProp
A [Metalsmith]("http://www.metalsmith.io/") plugin to copy or create file properties, and save under new keys

### Usage

`use(copyProp(from, to))`

**from** defines the value to be copied from the file object (here named **fileData**):
if `from` is '.', use `fileData.contents.toString()`.
if `from` is a String, use `fileData[from]` (shallow copy).
if `from` is a function, use `from(fileData, filePath, metalsmith)`.   

The value will be placed in the **to** property, _i.e._  `fileData[to] = value;`

### Possible uses:
 
##### You have existing markdown files and template files, but the names of some fields have changed over time and are incompatible.
_e.g._, if the template now uses {{ userName }} instead of {{ name }}, but you don't want to redo all the YAML:
       
`.use(copyProp('name', 'userName'))`
       
##### You want to preserve `.contents` before the next step processes them.
_e.g._, to preserve the raw contents before markdown changes them, add the following before `use(markdown())`:
       
    .use(copyProp('.', 'raw'))  // save contents
       // then 
    .use(markdown())            // before markdown changes them


##### You are lazy and want a quick-and-dirty plugin of your own.
_e.g._, to quickly hack your own not-very-smart excerpt plugin:

    .use(copyProp(function(data) {
                    return data.contents.toString().substring(0, 50);
                  },
                  'excerpt'))
                  

### Notes, Todos, and Caveats
       
If you want a deep copy, pass in a function for from and do it there.

Currently only supports a _single_ level of keys, _i.e._ `from` can be `"foo"` but not `"foo.bar"`.
       
To copy multiple fields, just use copyProp multiple times, _e.g._

    .use(copyProp('foo', 'bar'))
    .use(copyProp('abc', 'xyz'))
    
**Warning:** The code does not check if the property already exists, so be careful not to overwrite something you need!
