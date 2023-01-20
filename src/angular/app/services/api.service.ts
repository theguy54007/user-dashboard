import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from 'src/angular/environments/environment';

interface RequestMethod {
  (
    path: string,
    body?: {[key: string]: any},
    options?: {[key: string]: any}
  ) : Observable<any>
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(
    private httpClient: HttpClient
  ) { }

  apiUrl(path: string){
    return `${environment.restfulHost}/api/${path}`;
  }

  get: RequestMethod = (path, body?, options?) => {
    const params = this.handleBody(body);
    const url = `${this.apiUrl(path)}${params ? `?${params}` : ''}`;

    return this.httpClient.get(url, this.setupOptions(options)).pipe(
      catchError(this.errorHandle)
    )
  }

  post: RequestMethod = (path, body?, options?) => {
    return this.httpClient.post(this.apiUrl(path), this.handleBody(body), this.setupOptions(options)).pipe(
      catchError(this.errorHandle),
    )
  }

  patch: RequestMethod = (path, body?, options?) => {
    return this.httpClient.patch(this.apiUrl(path), this.handleBody(body), this.setupOptions(options)).pipe(
      catchError(this.errorHandle)
    )
  }

  delete: RequestMethod = (path, body?, options?) => {
    const params = this.handleBody(body);
    const url = `${this.apiUrl(path)}${params ? `${params}` : ''}`;

    return this.httpClient.delete(url, this.setupOptions(options)).pipe(
      catchError(this.errorHandle)
    )
  }


  private handleBody(body?: { [key: string]: any }): HttpParams {
    let params: HttpParams = new HttpParams();
    if (body) {
      for (const key of Object.keys(body)) {
        if (body[key]) {
          if (body[key] instanceof Array) {
            body[key].forEach((item: string | number | boolean) => {
              params = params.append(`${key.toString()}[]`, item);
            });
          } else {
            params = params.append(key.toString(), body[key]);
          }
        }
      }
    }

    return params;
  }

  private setupOptions(options?: {[k: string]: any, headers?: HttpHeaders}) {
    options = options || {}
    return Object.assign(options, {withCredentials: true});
  }

  private errorHandle(err: HttpErrorResponse) {
    return throwError( () => err )
  }

}
