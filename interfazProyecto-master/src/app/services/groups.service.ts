import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class GroupsService {
  constructor(private http: HttpClient) { }

  exportGroup(uniqueGroupID: string, groupName: string) {    
    this.http.get('http://localhost:3000/group/export/' + uniqueGroupID, {responseType: 'text/csv; charset=utf-8' as 'json'}).subscribe(result => {
      var a = document.createElement("a");
 
      if (window.navigator.msSaveOrOpenBlob) {
        var blob = new Blob([decodeURIComponent(encodeURI(result.toString()))], {
          type: "text/csv;charset=utf-8;"
        });
        navigator.msSaveBlob(blob, 'sample.csv');
      } else {
 
        a.href = 'data:attachment/csv;charset=utf-8,' + encodeURI(result.toString());
        a.target = '_blank';
        a.download = groupName + '.csv';
        document.body.appendChild(a);
        a.click();
      }
    });
  }

  getGroupsNames(): Observable<any> {
    return this.http.get<any>('http://localhost:3000/group/filter');
  }

  getAllGroups(tags: string): Observable<any> {
    const body = {tags : tags};
    return this.http.post<any>('http://localhost:3000/group/getall', body);
  }

  updateGroup(uniqueGroupID: string, groupName: string) {
    const body = { groupName: groupName };
    this.http.put<any>('http://localhost:3000/group/update/' + uniqueGroupID, body).subscribe(
      (val) => {
        console.log("POST call successful value returned in body",
          val);
      },
      response => {
        console.log("POST call in error", response);
      },
      () => {
        console.log("The POST observable is now completed.");
      });
  }

  deleteGroup(uniqueGroupID: string) {
    return this.http.delete<any>('http://localhost:3000/group/delete/' + uniqueGroupID).subscribe(
      (val) => {
        console.log("POST call successful value returned in body",
          val);
      },
      response => {
        console.log("POST call in error", response);
      },
      () => {
        console.log("The POST observable is now completed.");
      });
  }

  addGroup(groupName: string): Observable<any> {
    const body = { groupName: groupName };
    return this.http.post<any>('http://localhost:3000/group/add', body);
  }
}