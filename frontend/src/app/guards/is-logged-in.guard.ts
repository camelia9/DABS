import {Injectable} from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router} from '@angular/router';
import {Observable} from 'rxjs';
import {CookieService} from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class IsLoggedInGuard implements CanActivate {
  constructor(private $router: Router, public $cookie: CookieService) {
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (!this.isUserLoggedIn()) {
      return this.$router.parseUrl('/login');
    }

    if (state.url === '/') {
      return this.$router.parseUrl('/home');
    }

    return true;
  }

  private isUserLoggedIn() {
    // verify cookie
    return !!this.$cookie.get('user_token');
  }
}
