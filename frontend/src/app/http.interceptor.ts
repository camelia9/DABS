import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';
import {CookieService} from 'ngx-cookie-service';
import {Injectable} from '@angular/core';

@Injectable()
export class AddTokenInterceptor implements HttpInterceptor {
  constructor(
    private $cookies: CookieService
  ) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req.clone({
      setHeaders: {
        'X-Client-ID': this.$cookies.get('user_token')
      }
    }));
  }

}
