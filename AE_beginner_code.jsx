var window = new createDockableUI(this, "テストスクリプト");

window.orientation = "column";
var myInputGroup = window.add("group");
myInputGroup.orientation = "column";

var time_box = myInputGroup.add("group");
time_box.add("statictext", undefined, "長さ(秒)");
var time_length = 1;
var length = time_box.add("edittext", undefined, time_length);
length.characters = 5;

length.onChange = function () {
    if (isNaN(length.text)) {
        alert("使えるのは半角数字のみです。");
        return;
    }
    time_length = length.text;
}

var volume_box = myInputGroup.add("group");
volume_box.add("statictext", undefined, "音量(db)");
var volume_length = 20;
var length2 = volume_box.add("edittext", undefined, volume_length);
length2.characters = 5;

length2.onChange = function () {
    if (isNaN(length2.text)) {
        alert("使えるのは半角数字のみです。");
        return;
    }
    volume_length = length2.text;
}

var group = window.add("group", undefined, "");
group.orientation = "column";
var buttonOne = group.add("button", undefined, "暗転トランジション");

buttonOne.onClick = function () {
    if (app.project.activeItem == null || !(app.project.activeItem instanceof CompItem)) return false;
    // 選択した2つのレイヤーの終了と開始を暗転させ、音量もフェードさせます。
    var layers = GetSelectedLayers();

    for (var i = 0; i < layers.length; i++) {
        var data = layers[i];
        var startTime = (i > 0) ? layers[i - 1].end : data.start;
        var endTime = data.end;
        if (i > 0) {
            data.layer.property("ADBE Audio Group").property("ADBE Audio Levels").setValueAtTime(startTime, [-volume_length, -volume_length]);
            data.layer.property("ADBE Audio Group").property("ADBE Audio Levels").setValueAtTime(startTime + time_length, [0, 0]);
        }
        data.layer.property("ADBE Transform Group").property("ADBE Opacity").setValueAtTime(startTime, 0);
        data.layer.property("ADBE Transform Group").property("ADBE Opacity").setValueAtTime(startTime + time_length, 100);
        data.layer.property("ADBE Transform Group").property("ADBE Opacity").setValueAtTime(endTime - time_length, 100);
        data.layer.property("ADBE Transform Group").property("ADBE Opacity").setValueAtTime(endTime, 0);
        data.layer.property("ADBE Audio Group").property("ADBE Audio Levels").setValueAtTime(endTime - time_length, [0, 0]);
        data.layer.property("ADBE Audio Group").property("ADBE Audio Levels").setValueAtTime(endTime, [-volume_length, -volume_length]);
    }
}

function GetSelectedLayers() {
    var mycomp = app.project.activeItem;
    var layers = [];
    for (var i = 0; i < mycomp.selectedLayers.length; i++) {
        // 配置されているアイテムの一覧の情報をまとめたリストを作成します。あると便利です。
        var Layer = mycomp.selectedLayers[i];
        layers.push({ layer: Layer, id: Layer.id, index: Layer.index, name: Layer.name, start: Layer.inPoint, end: Layer.outPoint });
    }
    layers.sort(function (a, b) {
        if (a.start < b.start) return -1;
        if (a.start > b.start) return 1;
        if (a.index < b.index) return -1;
        if (a.index > b.index) return 1;
    })

    return layers;
}

alert("起動成功、邪魔なので消して使いましょう。");
showWindow(window);

// ドックパネル用のウィンドウを作成
function createDockableUI(thisObj, title) {
    var dialog =
        thisObj instanceof Panel
            ? thisObj
            : new Window("window", title, undefined, { resizeable: true });
    dialog.onResizing = dialog.onResize = function () {
        this.layout.resize();
    };
    return dialog;
}

function showWindow(myWindow) {
    if (myWindow instanceof Window) {
        myWindow.center();
        myWindow.show();
    }
    if (myWindow instanceof Panel) {
        myWindow.layout.layout(true);
        myWindow.layout.resize();
    }
}
