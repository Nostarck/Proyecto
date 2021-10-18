import { Component, OnInit, ViewChild } from '@angular/core';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { NgModule } from '@angular/core';
import { FormControl } from '@angular/forms';

import { LabelsService } from '../../services/labels.service';
import { ProblemsService } from '../../services/problems.service';


import { MaterialModule } from '../../material/material.module';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { SelectionModel } from '@angular/cdk/collections';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { ValueConverter } from '@angular/compiler/src/render3/view/template';
import { convertToObject } from 'typescript';
import { DialogBoxComponent } from 'src/app/components/dialog-box/dialog-box.component';


export interface PeriodicElement {
  name: string;
  id: number;
  tags: number;
  juez: string;
  fecha: string;
}

@NgModule({
  imports: [MaterialModule],
})

@Component({
  selector: 'app-tables, ngbd-accordion-basic',
  templateUrl: './problemas.component.html',
  styleUrls: ['./problemas.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', visibility: 'hidden' })),
      state('expanded', style({ height: '*', visibility: 'visible' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})

export class ProblemasComponent implements OnInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  


  selection = new SelectionModel<any>(true, []);

  displayedColumns: string[] = ['select','problemid', 'tags', 'judgeName', 'date'];
  displayedComments: string[] = ['comment'];

  dataSource = new MatTableDataSource();

  actualLabel: String;

  panelOpenState = false;

  //form and array button add/delete tags
  tags = new FormControl();
  tagsList : Array<any> = [];

  problemsList: Array<any> = [];

  //form and arrays filters

  selectedTags = new FormControl();
  selectedTagsList : Array<any> = [];

  judges = new FormControl();
  judgesList: Array<any> = [];

  constructor(private problemsService: ProblemsService, private labelsService: LabelsService, public dialog: MatDialog) {
    this.displayedColumns = this.displayedColumns;
    this.getTagNames();
    this.getJudgesNames();
    this.getProblems(null,null); 
  }

  openDialog(action, page, obj) {
    obj.action = action;
    obj.page = page;
    const dialogRef = this.dialog.open(DialogBoxComponent, {
      width: '250px',
      data:obj
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result.event == 'Editar'){

        this.updateComment(result.data);

      }
    });
  }

  updateComment(row_obj){
    var foundIndex = this.problemsList.findIndex(x => x.UUID === row_obj.UUID);
    this.problemsService.updateProblem(row_obj.UUID,row_obj.comment);
    this.problemsList[foundIndex].comment = row_obj.comment;     
    this.refreshTable();
    return true;
  }


  toggleTableRows(element) {
    this.dataSource.data.forEach((row:any) => {
      if(element == row.UUID){
        row.isExpanded = !row.isExpanded;
      }
    });
  }


  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }

  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id}`;
  }

  refreshTable(){
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.selection = new SelectionModel<any>(true, []);
    //this.judges = new FormControl();
    //this.selectedTags = new FormControl();
    //this.tags = new FormControl();
  }

  labelFilter(value: String){
    this.actualLabel= value;
  }

  refreshRows(){
    this.dataSource = new MatTableDataSource(this.problemsList);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    //this.judges = new FormControl();
    //this.selectedTags = new FormControl();
    //this.tags = new FormControl();
    this.selection = new SelectionModel<any>(true, []);
  }


  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  ngOnInit() {

  }

  //refresh button

  onSync(){
    this.problemsService.getSync().subscribe();
    this.getProblems(null,null);
  }

  //tag and untag action
  onClick(value : String){

    if(this.tags.value!=null){
      var tagIds : Array<string> = [];
      this.tags.value.forEach(
        value => {
           const foundIndex = this.tagsList.findIndex(x => x.name === value);
           tagIds.push(this.tagsList[foundIndex].id);
        }
     )
     var tagIdsString = tagIds.map(String).join(';');
    }
    else
      var tagIdsString = '';

    var selectProblems: Array<any> = this.selection.selected;
    var problemsIds : Array<string> = [];

    selectProblems.forEach(problem => 
      problemsIds.push(problem.UUID)
      );

    var problemIdsString = problemsIds.map(String).join(';');

    if(value == 'etiquetado') this.addTags(problemIdsString,tagIdsString);

    if(value == 'desetiquetado') this.deleteTags(problemIdsString,tagIdsString);
  }

  addTags( problems : string , tags : string) {
    if (tags === null){
      tags = "";
    }
    if (problems === null){
    problems = "";
    }

    this.problemsService.addTagToProblem(tags,problems);
    this.addTagsOnProblems();
  }

  addTagsOnProblems(){
    this.selection.selected.forEach(
      problem => {
      var foundIndex = this.problemsList.findIndex(x => x.UUID === problem.UUID);
      var tagsArray = this.problemsList[foundIndex].tags;
      var temptags = this.addNewTags(tagsArray,this.tags.value);

      this.problemsList[foundIndex].tags = temptags;   

      }
      );
      
      this.refreshTable();
  }

  deleteTags( problems : string , tags : string) {
    if (tags === null){
      tags = "";
    }
    if (problems === null){
    problems = "";
    }
    this.problemsService.removeTagFromProblem(tags,problems);
    //this.getProblems(null,null);
    this.deleteTagsOnProblems();
  }

  addNewTags(oldTags,selectedTags){

    var tempArray;

    if(selectedTags!=null){
      let newArray = [];
      for(let i=0;i<oldTags.length;i++){
        if(newArray.indexOf(oldTags[i]) == -1)
        newArray.push(oldTags[i])
      }
      for(let i=0;i<selectedTags.length;i++){
        if(newArray.indexOf(selectedTags[i]) == -1)
        newArray.push(selectedTags[i])
      }

      if(newArray[0]==null) {
        tempArray = newArray.slice(1);
   
        return tempArray;

      }

     

      return newArray;
    }
      return oldTags;
    }

  deleteTagsOnProblems(){
    this.selection.selected.forEach(
      problem => {
      var foundIndex = this.problemsList.findIndex(x => x.UUID === problem.UUID);
      var tagsArray = this.problemsList[foundIndex].tags;
      
      var temptags = this.deleteOldTags(tagsArray,this.tags.value);
      //temptags.shift();

      this.problemsList[foundIndex].tags = temptags;      
      }
      );
      this.selection = new SelectionModel<any>(true, []);
      this.refreshTable();
  }

  deleteOldTags(oldTags,selectedTags){

    if(selectedTags!=null){

      let newArray = [];
      for(let i=0;i<oldTags.length;i++){
        if(selectedTags.indexOf(oldTags[i]) == -1)
        newArray.push(oldTags[i])
      }
      return newArray;
    }
    else
      return oldTags;
    }

  //filters judges and tags



  filterProblems(action:String){


    if(this.selectedTags.value!=null){
      var tagIds : Array<string> = [];
      this.selectedTags.value.forEach(
        value => {
           const foundIndex = this.selectedTagsList.findIndex(x => x.name === value);
           tagIds.push(this.selectedTagsList[foundIndex].id);
        }
     )
     var tagIdsString = tagIds.map(String).join(';');

    }
    else
      var tagIdsString = '';

    if(this.judges.value!=null){
      
    var judgeIds : Array<string> = [];
    this.judges.value.forEach(
      value => {
          const foundIndex = this.judgesList.findIndex(x => x.name === value);
          judgeIds.push(this.judgesList[foundIndex].id);
      }
    )
    var judgeIdsString = judgeIds.map(String).join(';');
    }
    else
      var judgeIdsString = '';
  
  
  this.getProblems(judgeIdsString,tagIdsString);
  this.selection = new SelectionModel<any>(true, []);  
  }

  
  getTagNames() {
    this.labelsService.getTagNames().subscribe(
      data => {
        this.tagsList = data;
        this.selectedTagsList = data; 
      },

      error => console.log("Error: ", error),
    );
  }

  getProblems( judges : string , tags : string) {
    if (tags === null){
      tags = "";
    }
    if (judges === null){
    judges = "";
    }
    this.problemsService.getAllProblem(judges,tags).subscribe(
      data => {
        this.problemsList = data;
      },
      error => console.log("Error: ", error),
      () => this.refreshRows()
    );
  }

  getJudgesNames(){
    this.problemsService.getJudges().subscribe(
      data => {
        this.judgesList = data;
        

      },
      error => console.log("Error: ", error),
    );
  }

}
