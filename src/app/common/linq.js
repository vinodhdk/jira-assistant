//Array.prototype.ToArray= function() { return this; };
Array.prototype.Where = function (clause, maxItems) {
  var newArray = new Array();

  // The clause was passed in as a Method that return a Boolean
  for (var index = 0; index < this.length && (!maxItems || maxItems > newArray.length); index++) {
    if (clause(this[index], index)) {
      newArray[newArray.length] = this[index];
    }
  }
  return newArray;
};
Array.prototype.Select = function (clause, incNull) {
  var newArray = new Array();

  // The clause was passed in as a Method that returns a Value
  for (var i = 0; i < this.length; i++) {
    var data = clause ? clause(this[i], i) : this[i];
    if (data != null || incNull) {
      newArray[newArray.length] = data;
    }
  }
  return newArray;
}
Array.prototype.OrderBy = function (clause) {
  var tempArray = new Array();
  for (var i = 0; i < this.length; i++) {
    tempArray[tempArray.length] = this[i];
  }
  return tempArray.sort(function (a, b) {
    var x = clause ? clause(a) : a;
    var y = clause ? clause(b) : b;
    return ((x < y) ? -1 : ((x > y) ? 1 : 0));
  });
}
Array.prototype.OrderByDescending = function (clause) {
  var tempArray = new Array();
  for (var i = 0; i < this.length; i++) {
    tempArray[tempArray.length] = this[i];
  }
  return tempArray.sort(function (a, b) {
    var x = clause(b);
    var y = clause(a);
    return ((x < y) ? -1 : ((x > y) ? 1 : 0));
  })
}
Array.prototype.SelectMany = function (clause) {
  var r = new Array();
  for (var i = 0; i < this.length; i++) {
    r = r.concat(clause(this[i]));
  }
  return r;
}
Array.prototype.Count = function (clause) {
  if (clause == null) {
    return this.length;
  }
  else {
    return this.Where(clause).length;
  }
}
Array.prototype.Distinct = function (clause) {
  var item;
  var dict = new Object();
  var retVal = new Array();
  for (var i = 0; i < this.length; i++) {
    item = clause ? clause(this[i]) : this[i];
    if (dict[item] == null) {
      dict[item] = true;
      retVal[retVal.length] = item;
    }
  }
  dict = null;
  return retVal;
}
Array.prototype.DistinctObj = function (clause) {
  var item;
  var retVal = new Array();
  //var linq = retVal;
  for (var i = 0; i < this.length; i++) {
    item = clause ? clause(this[i]) : this[i];

    var keys = Object.keys(item);
    if (!retVal.Any(function (d) {
      var match = true;
      for (var i = 0; i < keys.length; i++) {
        match = match && d[keys[i]] == item[keys[i]];
      }
      return match;
    })) {
      retVal[retVal.length] = item;
    }
  }
  return retVal;
}
Array.prototype.Sum = function (clause) {
  var value = 0;
  if (clause) {
    for (var index = 0; index < this.length; index++) {
      value += clause(this[index]) || 0;
    }
  } else {
    for (var index = 0; index < this.length; index++) {
      value += parseFloat(this[index]) || 0;
    }
  }
  return value;
}
Array.prototype.Avg = function (clause) {
  var value = 0;
  var count = 0;
  if (clause) {
    for (var index = 0; index < this.length; index++) {
      var val = parseFloat(clause(this[index]));
      if (val || val === 0) { value = value + val; count++; }
    }
  } else {
    for (var index = 0; index < this.length; index++) {
      var val = parseFloat(this[index]);
      if (val || val === 0) { value = value + val; count++; }
    }
  }
  return count ? value / count : 0;
}
function prepareAgreData(data) {
  if (data && typeof data === "Date") {
    return data.getTime();
  } else { return data; }
}
Array.prototype.Max = function (clause) {
  var value = 0;
  if (clause) {
    for (var index = 0; index < this.length; index++) {
      var newVal = clause(this[index]) || 0;
      if (prepareAgreData(newVal) > prepareAgreData(value))
        value = newVal;
    }
  } else {
    for (var index = 0; index < this.length; index++) {
      var newVal = this[index] || 0;
      if (prepareAgreData(newVal) > prepareAgreData(value))
        value = newVal;
    }
  }
  return value;
}
Array.prototype.Min = function (clause) {
  var value = 0;
  if (clause) {
    for (var index = 0; index < this.length; index++) {
      var newVal = clause(this[index]) || 0;
      if (prepareAgreData(newVal) < prepareAgreData(value))
        value = newVal;
    }
  } else {
    for (var index = 0; index < this.length; index++) {
      var newVal = this[index] || 0;
      if (prepareAgreData(newVal) < prepareAgreData(value))
        value = newVal;
    }
  }
  return value;
}
Array.prototype.Any = function (clause) {
  if (typeof clause === "function") {
    for (var index = 0; index < this.length; index++) {
      if (clause(this[index], index)) { return true; }
    }
    return false;
  }
  else if (clause) {
    return this.indexOf(clause) >= 0;
  }
  else { return this.length > 0; }
}
Array.prototype.All = function (clause) {
  for (var index = 0; index < this.length; index++) {
    if (!clause(this[index], index)) { return false; }
  }
  return true;
}
Array.prototype.Reverse = function () {
  var retVal = new Array();
  for (var index = this.length - 1; index > -1; index--)
    retVal[retVal.length] = this[index];
  return retVal;
}
Array.prototype.First = function (clause) {
  if (clause != null) {
    return this.Where(clause, 1).First();
  }
  else {
    // If no clause was specified, then return the First element in the Array
    if (this.length > 0)
      return this[0];
    else
      return null;
  }
}
Array.prototype.Last = function (clause) {
  if (clause != null) {
    return this.Where(clause).Last();
  }
  else {
    // If no clause was specified, then return the First element in the Array
    if (this.length > 0)
      return this[this.length - 1];
    else
      return null;
  }
}
Array.prototype.ElementAt = function (index) {
  return this[index];
}
Array.prototype.Concat = function (array) {
  return this.concat(array);
}
Array.prototype.Intersect = function (secondArray, clause) {
  var clauseMethod;
  if (clause != undefined) {
    clauseMethod = clause;
  } else {
    clauseMethod = function (item, index, item2, index2) { return item == item2; };
  }

  var sa = secondArray.items || secondArray;

  var result = new Array();
  for (var a = 0; a < this.length; a++) {
    for (var b = 0; b < sa.length; b++) {
      if (clauseMethod(this[a], a, sa[b], b)) {
        result[result.length] = this[a];
      }
    }
  }
  return result;
}
Array.prototype.DefaultIfEmpty = function (defaultValue) {
  if (this.length == 0) {
    return defaultValue;
  }
  return this;
}
Array.prototype.ElementAtOrDefault = function (index, defaultValue) {
  if (index >= 0 && index < this.length) {
    return this[index];
  }
  return defaultValue;
}
Array.prototype.FirstOrDefault = function (defaultValue, clause) {
  return this.First(clause) || defaultValue;
}
Array.prototype.LastOrDefault = function (defaultValue, clause) {
  return this.Last(clause) || defaultValue;
}
Array.prototype.ForEach = function (clause) {
  var total = this.length;
  for (var index = 0; index < total; index++) {
    clause(this[index], index, {
      prev: this[index - 1],
      next: this[index + 1],
      count: total,
      isLast: index == total - 1,
      isFirst: index === 0
    })
  }
  return this;
}
Array.prototype.ToString = function (str) {
  str = str || ',';
  var returnVal = "";
  for (var index = 0; index < this.length; index++) {
    var val = this[index];
    if (val && ("" + val).length > 0)
      returnVal += str + val;
  }
  return returnVal.length ? returnVal.substring(str.length) : "";
};
Array.prototype.Remove = function (item) {
  //if (!item) return false;
  var i = this.indexOf(item);
  if (i < 0) return false;
  return this.splice(i, 1);
};
Array.prototype.RemoveAt = function (index, count) {
  if (index < 0) return false;
  return this.splice(index, count || 1);
};
Array.prototype.RemoveAll = function (clause) {
  var arr = this;
  if (typeof clause === "function") { this.RemoveAll(this.Where(clause)); }
  else if (typeof clause === "object") { clause.ForEach(function (o) { arr.Remove(o); }); }
};
Array.prototype.Add = function (item) {
  this.push(item);
  return item;
};
Array.prototype.InsertAt = function (index, item) {
  this.splice(index, 0, item);
  return item;
};
Array.prototype.InsertRangeAt = function (index, items) {
  this.splice(index, 0, ...items);
  return this;
};
Array.prototype.AddDistinct = function (item) {
  if (!this.Any(item)) {
    this[this.length] = item;
    return true;
  }
  return false;
};
Array.prototype.AddRange = function (items) {
  if (items) {
    for (var i = 0; i < items.length; i++) {
      this.Add(items[i]);
    }
  }
  return this;
};
Array.prototype.AddDistinctRange = function (items) {
  if (items) {
    for (var i = 0; i < items.length; i++) {
      this.AddDistinct(items[i]);
    }
  }
  return this;
};
Array.prototype.GroupBy = function (clause, filter) {
  var result = [];
  var valObj = {};
  for (var i = 0; i < this.length; i++) {
    var item = this[i];
    var key = clause(item);
    var keyStr = null;
    if (typeof key === "object") { keyStr = JSON.stringify(key); }
    var obj = valObj[keyStr || key];
    if (!obj) {
      obj = { key: key, values: [] };
      result.Add(valObj[keyStr || key] = obj);
    }
    if (!filter || filter(item)) {
      obj.values.Add(item);
    }
  }
  return result;
};
Array.prototype.Replace = function (item, newItem) {
  var idx = this.indexOf(item);
  if (idx != -1) this[idx] = newItem;
  return this;
};
Array.prototype.Clone = function (items) {
  var result = [];
  for (var i = 0; i < this.length; i++) {
    result[i] = this[i];
  }
  if (items && items.length > 0) {
    for (var i = 0; i < items.length; i++) {
      result[result.length] = items[i];
    }
  }
  return result;
};
Array.prototype.NotIn = function (items, condition) {
  if (!items || (Array.isArray(items) && items.length === 0)) { return this; }
  var ignoreCase = condition === true;
  if (ignoreCase) { items = items.Select(function (item) { return typeof item === "string" ? item.toLowerCase() : item; }); }
  if (condition && typeof condition != "function") { condition = null; }

  if (Array.isArray(items)) {
    if (!condition) {
      return this.Where(function (itm) {
        if (ignoreCase && typeof itm === 'string') { itm = itm.toLowerCase(); }

        return items.indexOf(itm) === -1
      });
    }
    else {
      return this.Where(function (itm) { return !items.Any(function (excl) { return condition(itm, excl); }); });
    }
  }
  else {

  }
}
Array.prototype.In = function (items, condition) {
  if (!items || (Array.isArray(items) && items.length === 0)) { return this; }
  var ignoreCase = condition === true;
  if (ignoreCase) { items = items.Select(function (item) { return typeof item === "string" ? item.toLowerCase() : item; }); }
  if (condition && typeof condition != "function") { condition = null; }

  if (Array.isArray(items)) {
    if (!condition) {
      return this.Where(function (itm) {
        if (ignoreCase && typeof itm === 'string') { itm = itm.toLowerCase(); }

        return items.indexOf(itm) > -1
      });
    }
    else {
      return this.Where(function (itm) { return items.Any(function (excl) { return condition(itm, excl); }); });
    }
  }
  else {

  }
}
Array.prototype.Skip = function (index) {
  if (index < 0) { index = 0; }
  var result = [];
  for (var i = index; i < this.length; i++) {
    result.Add(this[i]);
  }
  return result;
}
Array.prototype.Take = function (count) {
  var result = [];
  for (var i = 0; i < this.length && i < count; i++) {
    result.Add(this[i]);
  }
  return result;
}
Array.prototype.Union = function (clause) {
  var result = [];
  if (!clause) {
    clause = this;
  }
  if (Array.isArray(clause)) {
    for (var i = 0; i < clause.length; i++) {
      result.AddRange(clause[i]);
    }
  }
  else {
    this.ForEach(function (item, idx) {
      var newList = clause(item, idx);
      if (newList) {
        result.AddRange(newList);
      }
    });
  }
  return result;
}
Array.prototype.remove = function (func) {
  if (typeof func == "function") {
    for (var i = 0; i < this.length; i++) {
      if (func(this[i])) {
        this.splice(i, 1);
        return true;
      }
    }
  }
  else {
    var index = this.indexOf(func);
    if (index > -1) {
      this.splice(index, 1);
      return true;
    }
  }
}
Array.prototype.ContainsAny = function (arr) {
  var $this = this;
  if (arr && Array.isArray(arr)) {
    return arr.Any(function (obj) { return $this.indexOf(obj) >= 0; });
  }
  else { return false; }
}
Array.prototype.InnerJoin = function (rightArray, onClause) {
  var result = [];

  for (var i = 0; i < this.length; i++) {
    var left = this[i];
    var matches = rightArray.Where(function (right) { return onClause(left, right); });
    if (matches.length > 0) {
      matches.ForEach(function (right) {
        result.Add({ left: left, right: right });
      });
    }
  }

  return result;
}

Array.prototype.LeftJoin = function (rightArray, onClause) {
  var result = [];

  for (var i = 0; i < this.length; i++) {
    var left = this[i];
    var matches = rightArray.Where(function (right) { return onClause(left, right); });
    if (matches.length === 0) { result.Add({ left: left, right: null }); }
    else {
      matches.ForEach(function (right) {
        result.Add({ left: left, right: right });
      });
    }
  }

  return result;
}

Array.prototype.RightJoin = function (rightArray, onClause) {
  var result = [];

  for (var i = 0; i < rightArray.length; i++) {
    var right = rightArray[i];
    var leftMatches = this.Where(function (left) { return onClause(left, right); });
    if (leftMatches.length === 0) { result.Add({ left: null, right: right }); }
    else {
      leftMatches.ForEach(function (left) {
        result.Add({ left: left, right: right });
      });
    }
  }

  return result;
}
