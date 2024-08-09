import { entryPoints } from 'uxp';

entryPoints.setup({
  panels: {
    panel1: {
      show(event) {
        const panel = document.createElement("div");
        panel.innerHTML = `
          <h1>Playing Card Sheet Setup</h1>
          <button id="openPanel">Open Setup Panel</button>
        `;
        document.body.appendChild(panel);

        document.getElementById('openPanel').addEventListener('click', () => {
          const script = `
            #target photoshop
            app.bringToFront();
            const DOC_WIDTH_INCHES = 8.5;
            const DOC_HEIGHT_INCHES = 11;
            const RESOLUTION = 300;
            const CARD_WIDTH_INCHES = 2.5;
            const CARD_HEIGHT_INCHES = 3.5;
            const GUTTER_INCHES = 0.25;
            const DOC_WIDTH = DOC_WIDTH_INCHES * RESOLUTION;
            const DOC_HEIGHT = DOC_HEIGHT_INCHES * RESOLUTION;
            const CARD_WIDTH = CARD_WIDTH_INCHES * RESOLUTION;
            const CARD_HEIGHT = CARD_HEIGHT_INCHES * RESOLUTION;
            const GUTTER = GUTTER_INCHES * RESOLUTION;

            function createDocument(width, height, resolution) {
                return app.documents.add(width, height, resolution, "Playing Card Sheet");
            }

            function placeImage(doc, imagePath, x, y, width, height) {
                var imageFile = new File(imagePath);
                if (imageFile.exists) {
                    var placedImage = app.open(imageFile);
                    placedImage.resizeImage(UnitValue(width, "px"), UnitValue(height, "px"));
                    placedImage.selection.selectAll();
                    placedImage.selection.copy();
                    placedImage.close(SaveOptions.DONOTSAVECHANGES);

                    doc.paste();
                    var pastedLayer = doc.activeLayer;
                    pastedLayer.translate(x, y);
                } else {
                    throw new Error("The image file does not exist: " + imagePath);
                }
            }

            function saveDocument(doc, path) {
                var saveFile = new File(path);
                var psdOptions = new PhotoshopSaveOptions();
                doc.saveAs(saveFile, psdOptions, true);
                doc.close(SaveOptions.SAVECHANGES);
            }

            function createDialog() {
                var dialog = new Window("dialog", "Setup Playing Card Sheet", undefined, {resizeable: true});

                var header = dialog.add("group");
                header.orientation = "row";
                header.alignment = "center";
                var title = header.add("statictext", undefined, "Playing Card Sheet Setup", {alignment: "center"});
                title.graphics.font = ScriptUI.newFont("Arial", "Bold", 20);

                dialog.add("panel", undefined, undefined, {borderStyle: "etched"});

                var imageFileGroup = dialog.add("group");
                imageFileGroup.add("statictext", undefined, "Select an image:").helpTip = "Select the image file to be used for the cards";
                var imageFilePanel = imageFileGroup.add("panel", undefined, undefined, {borderStyle: "sunken"});
                var imageFileInput = imageFilePanel.add("edittext", undefined, "", {readonly: true});
                imageFileInput.preferredSize.width = 250;
                var browseButton = imageFilePanel.add("button", undefined, "Browse...");
                var imagePreview = imageFileGroup.add("image", undefined, undefined);
                imagePreview.preferredSize = [50, 50];

                browseButton.onClick = function() {
                    var imagePath = File.openDialog("Select an image to use for the cards", "*.jpg;*.jpeg;*.png;*.psd", false);
                    if (imagePath) {
                        imageFileInput.text = imagePath.fsName;
                        imagePreview.image = imagePath;
                    }
                };

                var saveLocationGroup = dialog.add("group");
                saveLocationGroup.add("statictext", undefined, "Save location:").helpTip = "Select the location to save the final card sheet";
                var saveLocationPanel = saveLocationGroup.add("panel", undefined, undefined, {borderStyle: "sunken"});
                var saveLocationInput = saveLocationPanel.add("edittext", undefined, "~/Desktop/PlayingCardSheet.psd", {readonly: true});
                saveLocationInput.preferredSize.width = 250;
                var saveBrowseButton = saveLocationPanel.add("button", undefined, "Browse...");

                saveBrowseButton.onClick = function() {
                    var savePath = File.saveDialog("Select save location", "*.psd");
                    if (savePath) {
                        saveLocationInput.text = savePath.fsName;
                    }
                };

                dialog.add("panel", undefined, undefined, {borderStyle: "etched"});

                var progressBarGroup = dialog.add("group");
                progressBarGroup.alignment = "center";
                var progressBar = progressBarGroup.add("progressbar", undefined, 0, 100);
                progressBar.preferredSize.width = 300;

                var buttonGroup = dialog.add("group");
                buttonGroup.alignment = "center";
                var okButton = buttonGroup.add("button", undefined, "OK");
                var cancelButton = buttonGroup.add("button", undefined, "Cancel");

                okButton.onClick = function() {
                    if (imageFileInput.text !== "" && saveLocationInput.text !== "") {
                        dialog.close(1);
                    } else {
                        alert("Please select both an image file and a save location.");
                    }
                };

                cancelButton.onClick = function() {
                    dialog.close(0);
                };

                var result = dialog.show();
                if (result === 1) {
                    return {
                        imagePath: imageFileInput.text,
                        savePath: saveLocationInput.text,
                        progressBar: progressBar
                    };
                } else {
                    return null;
                }
            }

            function setupCardSheet(imagePath, savePath, progressBar) {
                var doc = createDocument(DOC_WIDTH, DOC_HEIGHT, RESOLUTION);
                var totalCards = 6;
                var completedCards = 0;

                for (var row = 0; row < 2; row++) {
                    for (var col = 0; col < 3; col++) {
                        var x = col * (CARD_WIDTH + GUTTER);
                        var y = row * (CARD_HEIGHT + GUTTER);
                        placeImage(doc, imagePath, x, y, CARD_WIDTH, CARD_HEIGHT);
                        completedCards++;
                        progressBar.value = (completedCards / totalCards) * 100;
                    }
                }

                saveDocument(doc, savePath);
            }

            var userInput = createDialog();
            if (userInput) {
                setupCardSheet(userInput.imagePath, userInput.savePath, userInput.progressBar);
            }
          `;
          eval(script);
        });
      }
    }
  }
});