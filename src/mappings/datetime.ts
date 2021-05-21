import { BigInt } from '@graphprotocol/graph-ts';

export var SECS_PER_DAY = 60 * 60 * 24;
export var SECS_PER_HOUR = 60 * 60;

function floorDiv<T extends number>(a: T, b: T): T {
  return ((a >= 0 ? a : a - b + 1) / b) as T;
}

function euclidRem<T extends number>(a: T, b: T): T {
  var m = a % b;
  return (m + (m < 0 ? b : 0)) as T;
}

export function getDay(date: BigInt): BigInt {
  let time: i32 = date.toI32();
  let epochDays = i32(floorDiv(time, SECS_PER_DAY));
  return BigInt.fromI32(epochDays).times(BigInt.fromI32(SECS_PER_DAY));
}

export function getHour(date: BigInt): BigInt {
  let time: i32 = date.toI32();
  let epochDays = i32(floorDiv(time, SECS_PER_DAY));
  let epochHours = i32(euclidRem(time, SECS_PER_DAY)) / SECS_PER_HOUR;
  let days = BigInt.fromI32(epochDays).times(BigInt.fromI32(SECS_PER_DAY));
  let hours = BigInt.fromI32(epochHours).times(BigInt.fromI32(SECS_PER_HOUR));
  return days.plus(hours);
}

export function getDateString(date: BigInt): string {
  let time: i32 = date.toI32();

  let year: i32, month: i32, day: i32;

  let epochDays = i32(floorDiv(time, SECS_PER_DAY));

  let z = epochDays;
  z += 719468;
  var era = <u32>floorDiv(z, 146097);
  var doe = <u32>z - era * 146097; // [0, 146096]
  var yoe = (doe - doe / 1460 + doe / 36524 - doe / 146096) / 365; // [0, 399]
  year = yoe + era * 400;
  var doy = doe - (365 * yoe + yoe / 4 - yoe / 100); // [0, 365]
  var mo = (5 * doy + 2) / 153; // [0, 11]
  day = doy - (153 * mo + 2) / 5 + 1; // [1, 31]
  mo += mo < 10 ? 3 : -9; // [1, 12]
  month = mo;
  year += u32(mo <= 2);

  let dateString =
    year.toString() + '-' + month.toString() + '-' + day.toString();
  return dateString;
}

export function getTimeString(date: BigInt): string {
  let time: i32 = date.toI32();

  let year: i32, month: i32, day: i32, hours: i32;

  let epochDays = i32(floorDiv(time, SECS_PER_DAY));

  let z = epochDays;
  z += 719468;
  var era = <u32>floorDiv(z, 146097);
  var doe = <u32>z - era * 146097; // [0, 146096]
  var yoe = (doe - doe / 1460 + doe / 36524 - doe / 146096) / 365; // [0, 399]
  year = yoe + era * 400;
  var doy = doe - (365 * yoe + yoe / 4 - yoe / 100); // [0, 365]
  var mo = (5 * doy + 2) / 153; // [0, 11]
  day = doy - (153 * mo + 2) / 5 + 1; // [1, 31]
  mo += mo < 10 ? 3 : -9; // [1, 12]
  month = mo;
  year += u32(mo <= 2);

  hours = i32(euclidRem(time, SECS_PER_DAY)) / SECS_PER_HOUR;

  let dateString =
    year.toString() +
    '-' +
    month.toString() +
    '-' +
    day.toString() +
    '-' +
    hours.toString() +
    '00';
  return dateString;
}
