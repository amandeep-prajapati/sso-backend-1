function getCurrentDate() {
    let today_date = new Date();
    let day = (today_date.getDate() >= 10) ? today_date.getDate() : "0"+today_date.getDate();
    let month = (today_date.getMonth() + 1 >= 10) ? (today_date.getMonth() + 1) : "0"+(today_date.getMonth() + 1);
    let year = today_date.getFullYear();
    return year+"-"+month+"-"+day;
}

function getCurrentTime() {
    let today_date = new Date();
    let hours = (today_date.getHours() >= 10) ? today_date.getHours() : "0"+today_date.getHours();
    let minutes = (today_date.getMinutes() >= 10) ? today_date.getMinutes() : "0"+today_date.getMinutes();
    let seconds = (today_date.getSeconds() >= 10) ? today_date.getSeconds() : "0"+today_date.getSeconds();
    return hours+":"+minutes+":"+seconds;
}

function getFullDateTime() {
    let today_date = new Date();
    let day = (today_date.getDate() >= 10) ? today_date.getDate() : "0"+today_date.getDate();
    let month = (today_date.getMonth() + 1 >= 10) ? (today_date.getMonth() + 1) : "0"+(today_date.getMonth() + 1);
    let year = today_date.getFullYear();
    let hours = (today_date.getHours() >= 10) ? today_date.getHours() : "0"+today_date.getHours();
    let minutes = (today_date.getMinutes() >= 10) ? today_date.getMinutes() : "0"+today_date.getMinutes();
    let seconds = (today_date.getSeconds() >= 10) ? today_date.getSeconds() : "0"+today_date.getSeconds();
    return year+"-"+month+"-"+day+" "+hours+":"+minutes+":"+seconds;
}

function getHour() {
    let today_date = new Date();
    let hours = (today_date.getHours() >= 10) ? today_date.getHours() : "0"+today_date.getHours();
    return hours;
}

export { getCurrentDate, getCurrentTime, getFullDateTime, getHour }