import { Injectable } from '@angular/core';

@Injectable()
class LinqService {
  constructor(private $array) { }

  ToArray() { return this.$array; };

  Where(clause) {
    var newArray = new Array();

    // The clause was passed in as a Method that return a Boolean
    for (var index = 0; index < this.$array.length; index++) {
      if (clause(this.$array[index], index)) {
        newArray[newArray.length] = this.$array[index];
      }
    }
    return $Linq(newArray);
  };

  Select(clause, incNull?: boolean) {
    var newArray = new Array();

    // The clause was passed in as a Method that returns a Value
    for (var i = 0; i < this.$array.length; i++) {
      var data = clause(this.$array[i], i);
      if (data || incNull) {
        newArray[newArray.length] = data;
      }
    }
    return $Linq(newArray);
  }

  OrderBy(clause) {
    var tempArray = new Array();
    for (var i = 0; i < this.$array.length; i++) {
      tempArray[tempArray.length] = this.$array[i];
    }
    return $Linq(tempArray.sort(function (a, b) {
      var x = clause ? clause(a) : a;
      var y = clause ? clause(b) : b;
      return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    }));
  }

  OrderByDescending(clause) {
    var tempArray = new Array();
    for (var i = 0; i < this.$array.length; i++) {
      tempArray[tempArray.length] = this.$array[i];
    }
    return $Linq(tempArray.sort(function (a, b) {
      var x = clause(b);
      var y = clause(a);
      return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    }));
  }

  SelectMany(clause) {
    var r = new Array();
    for (var i = 0; i < this.$array.length; i++) {
      r = r.concat(clause(this.$array[i]));
    }
    return $Linq(r);
  }

  Count(clause) {
    if (clause == null)
      return this.$array.length;
    else
      return this.$array.Where(clause).length;
  }

  Distinct(clause) {
    var item;
    var dict = new Object();
    var retVal = new Array();
    for (var i = 0; i < this.$array.length; i++) {
      item = clause ? clause(this.$array[i]) : this.$array[i];
      if (dict[item] == null) {
        dict[item] = true;
        retVal[retVal.length] = item;
      }
    }
    dict = null;
    return $Linq(retVal);
  }

  DistinctObj(clause) {
    var item;
    var retVal = new Array();
    var $retVal = $Linq(retVal);
    //var linq = retVal;
    for (var i = 0; i < this.$array.length; i++) {
      item = clause ? clause(this.$array[i]) : this.$array[i];

      var keys = Object.keys(item);
      if (!$retVal.Any((d) => {
        var match = true;
        for (var i = 0; i < keys.length; i++) {
          match = match && d[keys[i]] == item[keys[i]];
        }
        return match;
      })) {
        retVal[retVal.length] = item;
      }
    }
    return $retVal;
  }

  Sum(clause) {
    var value = 0;
    if (clause) {
      for (var index = 0; index < this.$array.length; index++) {
        value += clause(this.$array[index]) || 0;
      }
    } else {
      for (var index = 0; index < this.$array.length; index++) {
        value += parseFloat(this.$array[index]) || 0;
      }
    }
    return value;
  }

  Avg(clause) {
    var value = 0;
    var count = 0;
    if (clause) {
      for (var index = 0; index < this.$array.length; index++) {
        var val = parseFloat(clause(this.$array[index]));
        if (val || val === 0) { value = value + val; count++; }
      }
    } else {
      for (var index = 0; index < this.$array.length; index++) {
        var val = parseFloat(this.$array[index]);
        if (val || val === 0) { value = value + val; count++; }
      }
    }
    return count ? value / count : 0;
  }

  Max(clause) {
    var value = 0;
    if (clause) {
      for (var index = 0; index < this.$array.length; index++) {
        var newVal = clause(this.$array[index]) || 0;
        if (prepareAgreData(newVal) > prepareAgreData(value))
          value = newVal;
      }
    } else {
      for (var index = 0; index < this.$array.length; index++) {
        var newVal = this.$array[index] || 0;
        if (prepareAgreData(newVal) > prepareAgreData(value))
          value = newVal;
      }
    }
    return value;
  }

  Min(clause) {
    var value = 0;
    if (clause) {
      for (var index = 0; index < this.$array.length; index++) {
        var newVal = clause(this.$array[index]) || 0;
        if (prepareAgreData(newVal) < prepareAgreData(value))
          value = newVal;
      }
    } else {
      for (var index = 0; index < this.$array.length; index++) {
        var newVal = this.$array[index] || 0;
        if (prepareAgreData(newVal) < prepareAgreData(value))
          value = newVal;
      }
    }
    return value;
  }

  Any(clause) {
    if (typeof clause === "function") {
      for (var index = 0; index < this.$array.length; index++) {
        if (clause(this.$array[index], index)) { return true; }
      }
      return false;
    }
    else {
      return this.$array.indexOf(clause) >= 0;
    }
  }

  All(clause) {
    for (var index = 0; index < this.$array.length; index++) {
      if (!clause(this.$array[index], index)) { return false; }
    }
    return true;
  }

  Reverse() {
    var retVal = new Array();
    for (var index = this.$array.length - 1; index > -1; index--)
      retVal[retVal.length] = this.$array[index];
    return $Linq(retVal);
  }

  First(clause) {
    if (clause != null) {
      return this.$array.Where(clause).First();
    }
    else {
      // If no clause was specified, then return the First element in the Array
      if (this.$array.length > 0)
        return this.$array[0];
      else
        return null;
    }
  }

  Last(clause) {
    if (clause != null) {
      return this.$array.Where(clause).Last();
    }
    else {
      // If no clause was specified, then return the First element in the Array
      if (this.$array.length > 0)
        return this.$array[this.$array.length - 1];
      else
        return null;
    }
  }

  ElementAt(index) {
    return this.$array[index];
  }

  Concat(array) {
    return $Linq(this.$array.concat(array));
  }

  Intersect(secondArray, clause) {
    var clauseMethod;
    if (clause != undefined) {
      clauseMethod = clause;
    } else {
      clauseMethod = (item, index, item2, index2) => { return item == item2; };
    }

    var sa = secondArray.items || secondArray;

    var result = new Array();
    for (var a = 0; a < this.$array.length; a++) {
      for (var b = 0; b < sa.length; b++) {
        if (clauseMethod(this.$array[a], a, sa[b], b)) {
          result[result.length] = this.$array[a];
        }
      }
    }
    return $Linq(result);
  }

  DefaultIfEmpty(defaultValue) {
    if (this.$array.length == 0) {
      return $Linq(defaultValue);
    }
    return $Linq(this.$array);
  }

  ElementAtOrDefault(index, defaultValue) {
    if (index >= 0 && index < this.$array.length) {
      return this.$array[index];
    }
    return defaultValue;
  }

  FirstOrDefault(defaultValue) {
    return this.$array.First() || defaultValue;
  }

  LastOrDefault(defaultValue) {
    return this.$array.Last() || defaultValue;
  }

  ForEach(clause) {
    for (var index = 0; index < this.$array.length; index++) {
      clause(this.$array[index], index)
    }
    return $Linq(this.$array);
  }

  ToString(str) {
    str = str || ',';
    var returnVal = "";
    for (var index = 0; index < this.$array.length; index++) {
      var val = this.$array[index];
      if (val && ("" + val).length > 0)
        returnVal += str + val;
    }
    return returnVal.length ? returnVal.substring(str.length) : "";
  };

  Remove(item) {
    if (!item) return false;
    var i = this.$array.indexOf(item);
    if (i < 0) return false;
    return $Linq(this.$array.splice(i, 1));
  };

  RemoveAt(index, count) {
    if (index < 0) return false;
    return $Linq(this.$array.splice(index, count || 1));
  };

  RemoveAll(clause) {
    var arr = this.$array;
    if (typeof clause === "function") { this.$array.RemoveAll(this.$array.Where(clause)); }
    else if (typeof clause === "object") { clause.ForEach(function (o) { arr.Remove(o); }); }
  };

  Add(item) {
    return (this.$array[this.$array.length] = item);
  };

  AddDistinct(item) {
    if (!this.$array.Any(item)) {
      this.$array[this.$array.length] = item;
    }
    return $Linq(this.$array);
  };

  AddRange(items) {
    if (items) {
      for (var i = 0; i < items.length; i++) {
        this.$array.Add(items[i]);
      }
    }
    return this;
  };

  AddDistinctRange(items) {
    if (items) {
      for (var i = 0; i < items.length; i++) {
        this.$array.AddDistinct(items[i]);
      }
    }
    return this;
  };

  GroupBy(clause, filter?) {
    var result = [];
    var $result = $Linq(result);
    var valObj = {};
    for (var i = 0; i < this.$array.length; i++) {
      var item = this.$array[i];
      var key = clause(item);
      var keyStr = null;
      if (typeof key === "object") { keyStr = JSON.stringify(key); }
      var obj = valObj[keyStr || key];
      if (!obj) {
        obj = { key: key, values: [] };
        $result.Add(valObj[keyStr || key] = obj);
      }
      if (!filter || filter(item)) {
        obj.values.Add(item);
      }
    }
    return $result;
  };

  Replace(item, newItem) {
    var idx = this.$array.indexOf(item);
    if (idx != -1) this.$array[idx] = newItem;
  };

  Clone(items) {
    var result = [];
    for (var i = 0; i < this.$array.length; i++) {
      result[i] = this.$array[i];
    }
    if (items && items.length > 0) {
      for (var i = 0; i < items.length; i++) {
        result[result.length] = items[i];
      }
    }
    return $Linq(result);
  };

  Skip(index) {
    if (index < 1) { index = 1; }
    var result = [];
    var $result = $Linq(result);
    for (var i = index - 1; i < this.$array.length; i++) {
      $result.Add(this.$array[i]);
    }
    return $result;
  }

  Take(count) {
    var result = [];
    var $result = $Linq(result);
    for (var i = 0; i < this.$array.length && i < count; i++) {
      $result.Add(this.$array[i]);
    }
    return $result;
  }

  Union(clause?) {
    var result = [];
    var $result = $Linq(result);
    if (Array.isArray(clause)) {
      for (var i = 0; i < clause.length; i++) {
        $result.AddRange(clause[i]);
      }
    }
    else if (clause instanceof Function) {
      this.$array.ForEach(function (item) {
        $result.AddRange(clause(item));
      });
    }
    else {
      this.$array.ForEach(function (item) {
        $result.AddRange(item);
      });
    }
    return $result;
  }
}
export function $Linq($array: Array<any>) {
  return new LinqService($array);
}

function prepareAgreData(data) {
  if (data && data instanceof Date) {
    return data.getTime();
  } else { return data; }
}
