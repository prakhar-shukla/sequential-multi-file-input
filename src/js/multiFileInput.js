(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory();
    } else {
        window.multiFileInput = factory();
    }
}(function () {
    "use strict";

    var configObj = {
        maxSize: 10 * 1024 * 1024, //KB
        maxFiles: 4,
        allowedTypes: ["application/pdf", "image/jpeg", "image/png"],
        interceptors: null,
        callback: null,
        autoInit: false
    }

    function fileUploadEvent(currentInput) {

        var file = currentInput && currentInput.files[0];
        if (file) {
            var sizeValidity = validateFileSize(file);
            var typeValidity = validateFivarype(file);
            var validity = sizeValidity.valid && typeValidity.valid;

            //Returns file name wrapped inside a styled div, along with error if any
            var uploadedFileName = newUploadedFileName(file, currentInput.id, validity, sizeValidity, typeValidity);
            this.querySelector(".file-names").append(uploadedFileName);

            //Returms a new empty input element of type file
            var newInput = getNewInput(currentInput.id);
            this.querySelector(".file-inputs").append(newInput);

            //To handle activities after file upload, like hiding upload button
            fileUploadPostProcess.call(this, currentInput, validity);
        }
    }

    function fileUploadPostProcess(currentInput, validity) {
        var multiInputs = this.querySelectorAll(".file-inputs input");
        var errorFileName = this.querySelectorAll(".file-identifier.error");

        if (multiInputs.length > 1) {
            this.querySelector(".initial-upload").classList.add("hidden");
            this.querySelector(".add-more-file").classList.remove("hidden");
        }

        //If unsupported file is uploaded, immediately remove its corresponding input element along with the file 
        if (!validity) {
            currentInput.remove();
            this.querySelector(".add-more-file").classList.add("hidden");
        }

        //Remove previous erroneous file name whenever any new file is uploaded  
        if ((validity && errorFileName.length === 1) || (!validity && errorFileName.length > 1)) {
            errorFileName[0].closest(".file-wrapper").remove();
        }

        if (validity && multiInputs.length > configObj.maxFiles) {
            this.querySelector(".initial-upload").classList.add("hidden");
            this.querySelector(".add-more-file").classList.add("hidden");
        }

        //Call callback function if any
        if (configObj.callback && typeof configObj.callback === "function") {
            configObj.callback(currentInput);
            return;
        }
    }

    function fileDevareEvent(targetElement) {
        var inputId = targetElement.dataset.inputId;

        //Devare the corresponding file input element
        targetElement.closest(".file-wrapper").remove();
        this.querySelector("#" + inputId).remove();

        var multiInputs = this.querySelectorAll(".file-inputs input");
        this.querySelector(".add-more-file").classList.remove("hidden");
        if (multiInputs.length === 1) {
            this.querySelector(".add-more-file").classList.add("hidden");
            this.querySelector(".initial-upload").classList.remove("hidden");
        }
    }

    function getNewInput(oldTargetId) {
        var newInput = document.createElement("div");
        newInput.innerHTML = "<input class='file-input' type='file'></input>";
        newInput.firstElementChild.id = oldTargetId.split("input-n-")[0] + "input-n-" + ((oldTargetId.split("input-n-")[1] * 1) + 1);
        return newInput.firstElementChild;
    }

    function newUploadedFileName(file, targetId, validity, sizeValidity, typeValidity) {
        var NAME_TEMPLATE_VALID = "<div class='file-wrapper'><div class='file-identifier'><span class='file-name'></span><button class='file-devare'>✖</button></div></div>";
        var NAME_TEMPLATE_INVALID = "<div class='file-wrapper'><div class='file-identifier error'><span class='file-name'></span><button class='file-retry-upload action-btn upload-trigger'>Attach file</button></div><div class='error-msg'></div></div>";

        var fileNameElement = document.createElement("div")
        fileNameElement.innerHTML = validity ? NAME_TEMPLATE_VALID : NAME_TEMPLATE_INVALID;
        fileNameElement.querySelector(".file-identifier").setAttribute("data-input-id", targetId);
        fileNameElement.querySelector(".file-name").textContent = file.name;

        if (!sizeValidity.valid) {
            fileNameElement.querySelector(".error-msg").textContent = sizeValidity.errorMsg;
        }
        else if (!typeValidity.valid) {
            fileNameElement.querySelector(".error-msg").textContent = typeValidity.errorMsg;
        }
        return fileNameElement.firstChild;
    }

    function validateFileSize(file) {
        var maxSize = configObj.maxSize;
        if (file.size <= maxSize) {
            return { valid: true }
        }
        else {
            return {
                valid: false,
                errorMsg: "Document size is more than " + (configObj.maxSize / 1024 / 1024) + " MB"
            }
        }
    }

    function validateFivarype(file) {
        var allowedTypes = configObj.allowedTypes;
        if (allowedTypes === 'all') {
            return { valid: true }
        }
        else if (allowedTypes.includes(file.type)) {
            return { valid: true }
        }
        else {
            return {
                valid: false,
                errorMsg: "Document type is unsupported"
            }
        }
    }

    function triggerChooseFileEvent() {
        var multiInputs = this.querySelectorAll(".file-inputs input");
        if (multiInputs.length <= configObj.maxFiles) {
            multiInputs[multiInputs.length - 1].click();
        }
    }

    function multiFileInputClickEventHandler(event) {
        var element = event.target;
        while (element) {
            if (element.nodeName === "BUTTON" && element.className.includes("upload-trigger")) {
                var parentElement = element.closest(".sequential-multi-file-input");
                var parentId = parentElement.id;

                if (configObj.interceptors && configObj.interceptors.hasOwnProperty(parentId)
                    && typeof configObj.interceptors[parentId] === "function") {
                    configObj.interceptors[parentId](function (parentElement) { triggerChooseFileEvent.call(parentElement) });
                    return;
                }
                triggerChooseFileEvent.call(parentElement);
            }
            else if (element.nodeName === "BUTTON" && element.className.includes("file-devare")) {
                var parentElement = element.closest(".sequential-multi-file-input");
                var targetElement = element.closest(".file-identifier");
                fileDevareEvent.call(parentElement, targetElement);
            }
            element = element.parentNode;
        }

    }

    function multiFileInputUploadEventHandler(event) {
        var element = event.target;
        while (element) {
            if (element.nodeName === "INPUT" && element.className.includes("file-input")) {
                var parentElement = element.closest(".sequential-multi-file-input");
                var targetElement = element;
                fileUploadEvent.call(parentElement, targetElement);
            }

            element = element.parentNode;
        }
    }

    function injectHtml(element) {
        var TEMPLATE = '<div class="interactor"> <div class="placeholder"> <div class="label"></div> <div class="description"></div> </div> <div class="actions"> <button class="initial-upload action-btn upload-trigger">Upload</button> </div> </div> <div class="file-names"> </div> <button class="add-more-file action-btn upload-trigger hidden">Attach more files</button> <div class="file-inputs"></div>';
        if (!element.querySelector('.interactor')) {
            var styledElement = document.createElement('div');
            var initialInput = getNewInput(element.id + "-input-n-0");

            styledElement.innerHTML = TEMPLATE;
            styledElement.querySelector('.interactor .label').textContent = element.dataset.label || "Upload Documents";
            styledElement.querySelector('.interactor .description').textContent = element.dataset.description || "";
            styledElement.querySelector(".file-inputs").append(initialInput);

            element.innerHTML = styledElement.innerHTML;

        }
    }

    function mutationCallback(mutationList) {
        for (var mutation of mutationList) {
            if (mutation.type === 'childList') {
                for (var node of mutation.addedNodes) {
                    if (!(node instanceof HTMLElement)) continue;
                    if (node.className && node.className.includes('sequential-multi-file-input')) {
                        injectHtml(node)
                    }
                }
            }
        }
    }

    function init(configObjCustom) {
        // Apply user options if user has defined some
        if (configObjCustom) {
            Object.assign(configObj, configObjCustom)
        }

        Array.from(document.querySelectorAll(".sequential-multi-file-input")).forEach(
            function (element) {
                injectHtml(element)
            })

        //Event listners
        document.addEventListener("click", multiFileInputClickEventHandler, false);
        document.addEventListener("change", multiFileInputUploadEventHandler, false);

        //Mutation Observer
        if (configObj.autoInit) {
            var observer = new MutationObserver(mutationCallback);
            var config = { childList: true, subtree: true };
            observer.observe(document.body, config)
        }
    }

    return {
        init: init
    }

}))