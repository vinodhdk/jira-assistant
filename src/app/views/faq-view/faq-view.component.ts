import { Component, OnInit } from '@angular/core';
import * as faqData from '../../common/faq.json'
import { ActivatedRoute } from '@angular/router';

const faqArray: any[] = <any>faqData;
//const ignoreList = ['how', 'can', 'will', 'be', 'a', 'able', 'i', 'do', 'this'];
@Component({
  selector: 'ja-faq-view',
  templateUrl: './faq-view.component.html'
})
export class FaqViewComponent implements OnInit {
  suggestions: any[]
  searchText: any
  searchResults: any[]

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.searchText = (params['query'] || "").trim();
      if (this.searchText.length > 0) {
        this.search();
      }
    });
  }

  getSuggestion($event) {
    var query = ($event.query || "").trim().toLowerCase();
    if (!query) { return; }
    this.suggestions = faqArray.Union(f => {
      var quest = f.questions.Where(q => q.toLowerCase().indexOf(query) > -1).Select(q => { return { id: f.id, text: q }; }).Take(1);
      return quest;
    });
  }

  search() {
    var query = this.searchText;
    if (typeof query === "string") {
      this.searchResults = faqArray.Where(f => {
        return f.questions.Any(q => q.toLowerCase().indexOf(query) > -1)
          || f.strand.toLowerCase().indexOf(query) > -1
          || f.description.toLowerCase().indexOf(query) > -1
          || (f.keywords && f.keywords.Any(k => k.toLowerCase().indexOf(query) > -1 || query.indexOf(k) > -1));
      });
    }
    else {
      var option = faqArray.First(f => f.id === query.id);
      this.searchResults = [option];
    }
  }

  getDescription(res) {
    var descr: string = res.description;

    var lines = descr.split('\n');
    var result = "";

    lines.ForEach((str, idx, opt) => {
      var curOpts = this.getLineOpts(str);
      var prevOpts = this.getLineOpts(opt.prev);

      if (curOpts.isList) {
        if (!prevOpts.isList) {
          result += '<' + curOpts.listType + '>';
        }
        result += curOpts.html;
      }
      else {
        if (prevOpts.isList) {
          result += '</' + prevOpts.listType + '>';
        }
        result += curOpts.html;
      }
    });
    // .replace(/(\n)/g, "<br />");
    return result;
  }

  private getLineOpts(str: string): any {
    if (!str) { return false; }

    var isNextLvl = str.charAt(0) === '>';
    var isOL = str.charAt(isNextLvl ? 1 : 0) === '-';
    var isUL = str.charAt(isNextLvl ? 1 : 0) === '*';

    var isList = isOL || isUL;
    var line = str.substring((isNextLvl ? 1 : 0) + (isList ? 1 : 0)).trim();
    line = line.replace(/~(.*)~/g, '<i class="fa $1"></i>');
    var listType = null;
    if (isList) { line = '<li>' + line + '</li>'; listType = isOL ? 'ol' : 'ul'; }
    else { line += '<br />'; }

    return { isList: isList, subLevel: isNextLvl, isOL, isUL, listType: listType, html: line }
  }

  getInterestText(id: string) {
    if (!id) { return; }
    var item = faqArray.First(f => f.id === id);
    if (item) {
      return item.strand;
    }
    else { console.log("No faq found, ID=", id); }
  }

  addInterest(id: string) {
    if (!id) { return; }
    var newResult = faqArray.First(f => f.id === id);
    if (this.searchResults.indexOf(newResult) == -1) {
      this.searchResults.Add(newResult);
    }
  }
}
