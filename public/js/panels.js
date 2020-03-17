$(function () {
    $('#tabs li:last-child a').tab('show')
})
$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
    e.target // newly activated tab
    e.relatedTarget // previous active tab
})

var el = document.getElementById('wayPointsList');
var sortable = Sortable.create(el, {
    onEnd: function (evt) {
        var itemEl = evt.item;  // dragged HTMLElement
		evt.to;    // target list
		evt.from;  // previous list
		evt.oldIndex;  // element's old index within old parent
		evt.newIndex;  // element's new index within new parent
		evt.oldDraggableIndex; // element's old index within old parent, only counting draggable elements
		evt.newDraggableIndex; // element's new index within new parent, only counting draggable elements
		evt.clone // the clone element
        evt.pullMode;  // when item is in another sortable: `"clone"` if cloning, `true` if moving
        console.log(itemEl.id, evt.oldIndex, evt.newIndex)
    }
});