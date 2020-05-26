# Sequential-multi-file-input :paperclip:
Sequentially input multiple files through a single trigger point. 

I have always wondered why there is no option to select multiple files one after another in the native input element. Although we can add ```multiple``` attribute in the input element to allow selection of more than one file, but all those files have to be selected in one go. Sometimes this behavior does not meet the requirements and can be non user friendly.

Behind the scene, it uses simple input elements of `type="file"`. For every file uploaded, it will add a new input element to accept any further file. Every single input element will hold a unique file.

## Initialize It

To create a new sequential-file-input element, an empty div needs to be given a `"sequential-multi-file-input"` class. The element can optionally be given custom label and description. A unique id required to use multiple similar elements on a single page.
```html
 <div class="sequential-multi-file-input" id="multiInput1" data-label="Upload documents" data-description="Document description"></div>
```
Calling the `init` function will then transform the empty div into a fully functional sequential-file-input element. 
```javascript 
multiFileInput.init()
```

By default, the element will be initialized with following options:
```javascript
{
   maxSize: 1 * 1024 * 1024,  //KB
   maxFiles: 4,
   allowedTypes: ["application/pdf", "image/jpeg"],
   interceptors: null,
   callback: null,
   autoInit: false
}
```
## AutoInit
But what happens if a new element is added dynamically? It does not have to be initialized manually, instead the `autoInit` option can be used. It registers a MutationObserver, which will automatically initialize any new element having the `sequential-multi-file-input` class
```javascript
 multiFileInput.init({autoInit:true});
```

 ## Callback
A callback function can be passed, which will be called after every file select event.
```javascript
multiFileInput.init({callback:function(currentInput){
   //currentInput is a html element of type 'file' holding the selected file
}});
```
## Interceptors
An interceptor function can be passed, which will be called immediately before opening the file select dialog.
The interceptor property is itself an object, which holds the callback functions against a specified element, identified by its id
```javascript
multiFileInput.init({
        interceptors: {
            "multiInput1": function (openFileInputDialog) {
                    //openFileInputDialog is a function, calling which will open the file select dialog
             }
        }
});
```
The interceptor function will receive the file select dialog trigger function as its argument.

## MaxSize, MaxFiles, AllowedTypes
The default options can be overwritten by passing different values. The `maxSize` property expects value in KiloBytes. 
`allowedTypes` can be set to accept all values by passing `"all"` as its value, or it can be multiple types in form of an array         `["application/pdf", "image/png"]`.

```javascript
  multiFileInput.init({
      maxSize: 10 * 1024 * 1024, //KB
      maxFiles: 2,
      allowedTypes: 'all',
  });
```
## Access the files
All selected files are stored in seperate input elements. If an invalid file is uploaded, the input element corresponding to that file will be immediately removed from the DOM. All the valid input elements are stored in this form.
```html
 <div class="sequential-multi-file-input" id="multiInput1" data-label="Upload documents">
        ...
        ...
        <div class="file-inputs"> 
          <input class="file-input" type="file" id="multiInput1-input-n-1">
          <input class="file-input" type="file" id="multiInput1-input-n-2">
          <input class="file-input" type="file" id="multiInput1-input-n-3">
          ...
          ...
        </div>
 </div>
```
