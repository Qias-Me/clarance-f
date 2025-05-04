
class Utils {
  static formatDateToInputValue(date: Date | string): string {
    if (typeof date === "string") return date; // Assume already in YYYY-MM-DD format
    return date.toISOString().split("T")[0];
  }

  static generateUUID() {
    return ([1e7].join('') + (-1e3 + -4e3 + -8e3 + -1e11)).replace(/[018]/g, c =>
      (parseInt(c, 16) ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> parseInt(c, 16) / 4).toString(16)
    );
  }

  static generateUUIDv2() { // Public Domain/MIT
    let d = new Date().getTime();//Timestamp
    let d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now()*1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        let r = Math.random() * 16;//random number between 0 and 16
        if(d > 0){//Use timestamp until depleted
            r = (d + r)%16 | 0;
            d = Math.floor(d/16);
        } else {//Use microseconds since page-load if supported
            r = (d2 + r)%16 | 0;
            d2 = Math.floor(d2/16);
        }
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}
  
}

export default Utils;
