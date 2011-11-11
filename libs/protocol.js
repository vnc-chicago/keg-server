//	**arduino --> node**
//
// * `**FLOW_number**` (*number* indicates the current flow rate, where *number* is in liters/min)
// * `**FLOW_END**`	(indicates that pouring is complete e.g. solenoid closed)
// * `**POUR_amt**` (*amt* indicates the amount poured)
// * `**TAG_rfid**`	(*rfid* indicates an rfid scan, where *rfid* is the value that was scanned)
// * `**TAG_0000000000**`	(special case of the above: solenoid closed)
// * `**TEMP_temp**`	(*temp* indicates the current keg temp, where *temp* is in F)

exports.FLOW = 'FLOW';
exports.POUR = 'POUR';
exports.TAG = 'TAG';
exports.TEMP = 'TEMP';
exports.messages = [exports.FLOW, exports.POUR, exports.TAG, exports.TEMP];

//	**node --> arduino**
//
// * `**REQUEST_TAG**`	(requests the last rfid tag scanned)
// * `**REQUEST_TEMP**`	(requests the current temperature)
// * `**REQUEST_FLOW**`	(requests the current flow rate)
// * `**REQUEST_OPEN**`	(requests that the solenoid open to pour some brewski)

exports.REQUEST_TAG = '**REQUEST_TAG**';
exports.REQUEST_TEMP = '**REQUEST_TEMP**';
exports.REQUEST_FLOW = '**REQUEST_FLOW**';
exports.REQUEST_OPEN = '**REQUEST_OPEN**';
