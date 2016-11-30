var test = require('tape');
var keymaster = require('../keymaster.js');

// setup - need to recreate these each time
function createFiles() {
   return {
      "file1.md" : {
         title: "title of file1.md",
         contents: new Buffer('Contents for file1.md   Lorem ipsum dolor')
      },
      "file2.html" : {
         title: "title of file2.html",
         contents: new Buffer('Contents for file2.html Lorem ipsum dolor')
      }
   }
};

// need this
function done(err) { if (err) throw err; }


test('simple copy ', function(t) {
   var files = createFiles();
   keymaster('title', 'newtitle')(files, null, done);
   keymaster('.', 'copyContents')(files, null, done);
   Object.keys(files).forEach(function(filePath) {
      fileData = files[filePath];
      t.equal(fileData.title, fileData.newtitle);
      t.equal(fileData.contents.toString(), fileData.copyContents);
   });

   t.end();
});


test('filefilter', function(t) {
   var files = createFiles();

   // test Regex and string
   keymaster('title', 'newtitle', /md$/)(files, null, done);
   keymaster('.', 'copyContents', 'html$')(files, null, done);

   fileData = files['file1.md']
   t.true(fileData.newtitle);
   t.false(fileData.copyContents);

   fileData = files['file2.html']
   t.false(fileData.newtitle);
   t.true(fileData.copyContents);

   // test user provided function
   keymaster('.', 'copyContents',
              function(filePath) { return 'file1.md' === filePath}
             )(files, null, done);
   t.true(files['file1.md'].copyContents);

   t.end();
});

test('examples similar to README', function(t) {
   var files = createFiles();
   keymaster(function(data) {
                return data.contents.toString().substring(24, 35);  // slight change from readme
             },
             'excerpt')(files, null, done);
   keymaster(function(data, filePath) {
               return filePath;
            },
            'yourKeyHere')(files, null, done);

   t.equal(files['file1.md'].excerpt, 'Lorem ipsum');
   t.equal(files['file2.html'].yourKeyHere, 'file2.html');

   t.end();
});
