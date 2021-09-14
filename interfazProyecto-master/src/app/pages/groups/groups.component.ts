import { Component, OnInit } from '@angular/core';
import { GroupsService } from '../../services/groups.service';
import { LabelsService } from '../../services/labels.service';
import { DatePipe } from '@angular/common';

import { ViewChild} from '@angular/core';
import {MatTableDataSource} from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import {MatPaginator} from '@angular/material/paginator';
import { SelectionModel} from '@angular/cdk/collections';
import { FormControl } from '@angular/forms';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { MatSort } from '@angular/material/sort';
import { DialogBoxComponent } from '../../components/dialog-box/dialog-box.component';
import { Router } from '@angular/router'



@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.scss'],
  providers: [DatePipe],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class GroupsComponent implements OnInit {

  
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  panelOpenState = false;

  tags = new FormControl();

  //Aqui se guarda lo devuelto por el servicio para las etiquetas del filtrado (dropdown)
  tagResult: Array<any> = [];
  
  // Modelo para el select
  selection = new SelectionModel<any>(true, []);

   //Aqui se guarda lo devuelto por el servicio
   allGroupsResult: Array<any> = [];

   // Aqui se carga lo devuelto por el servicio
  dataSource = new MatTableDataSource();

  // Elementos que se van a mostrar en la tabla
  displayedGroupsColumnsList: string[] = ['select','name'];
  displayedStudentsColumnsList: string[] = ['studentid','fullname', 'CodeForces', 'CodeChef', 'UVA'];
  headersStudentsColumnsList: string[] = ['ID Estudiante','Nombre Completo', 'CodeForces', 'CodeChef', 'UVA'];

  constructor(private groupsService: GroupsService, private labelsService: LabelsService, public dialog: MatDialog, private datePipe: DatePipe, private router: Router) {
   this.getTagNames();
   this.getAllGroups(null);
 }

  ngOnInit(): void {}

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort; 
  }
  expandContent = true;
  
  toggleTableRows(element) {
    this.dataSource.data.forEach((row:any) => {
      if(element == row.id){
        row.isExpanded = !row.isExpanded;
      }
    });
  }

  getKeys(object): string[] {
   //console.log(object);
   return Object.keys(object);
 }

 getTagNames() {
   this.labelsService.getTagNames().subscribe(
     data => {
       this.tagResult = data;
     },
     error => console.log("Error: ", error),
   );
 }

 getAllGroups(tags: string) {
   if (tags === null){
      tags = "";
   }
   this.groupsService.getAllGroups(tags).subscribe(
     data => {
       this.allGroupsResult = data;
       console.log(this.allGroupsResult);
     },
     error => console.log("Error: ", error),
     () => this.refreshRows()
   );
 }

 refreshRows(){
   this.dataSource = new MatTableDataSource(this.allGroupsResult);
   this.dataSource.sort = this.sort;
   this.dataSource.paginator = this.paginator;
 }

 refreshTable(){
  this.dataSource.sort = this.sort;
  this.dataSource.paginator = this.paginator;
}

 //Corregir, llega el body vacio entonces no hace el filtrado
 filterGroups(tags: Array<string>) {
   var tagIds : Array<string> = [];
   tags.forEach(
      value => {
         const foundIndex = this.tagResult.findIndex(x => x.name === value);
         tagIds.push(this.tagResult[foundIndex].id);
      }
   )
   var tagIdsString = tagIds.map(String).join(';');
   this.getAllGroups(tagIdsString);
 }

  openDialog(action, page, obj) {
    obj.action = action;
    obj.page = page;
    const dialogRef = this.dialog.open(DialogBoxComponent, {
      width: '250px',
      data:obj
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result.event == 'Agregar'){
        this.addRowData(result.data);
      }else if(result.event == 'Editar'){
        this.updateRowData(result.data);
      }else if(result.event == 'Eliminar'){
        this.deleteRowData(result.data);
      }else if(result.event == 'Exportar'){
        this.exportRowData(result.data);
      }
    });
  }

  addRowData(row_obj){
    var myDate = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
    this.groupsService.addGroup(row_obj.name).subscribe(
      data => {
        this.allGroupsResult.unshift({id: data.id, isExpanded: false, name: data.name, students: null})
      },
      error => console.log("Error: ", error),
      () => this.refreshTable()
    );
  }

  updateRowData(row_obj){
    this.groupsService.updateGroup(row_obj.id, row_obj.name);
    const foundIndex = this.allGroupsResult.findIndex(x => x.id === row_obj.id);
    this.allGroupsResult[foundIndex].name = row_obj.name;

    this.refreshTable();
    return true;
  }

  deleteRowData(row_obj){
    this.groupsService.deleteGroup(row_obj.id);
    const foundIndex = this.allGroupsResult.findIndex(x => x.id === row_obj.id);
    this.allGroupsResult.splice(foundIndex, 1);

    this.refreshTable();
    return true;
  }

  exportRowData(row_obj){
    this.groupsService.exportGroup(row_obj.id, row_obj.name);
    return true;
  }



}


