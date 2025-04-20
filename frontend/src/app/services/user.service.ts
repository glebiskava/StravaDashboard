import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = 'http://localhost:5000/user';

  constructor(private http: HttpClient) {}

  getUserProfile() {
    return this.http.get<any>(this.apiUrl);
  }

  updateUserProfile(profile: any) {
    return this.http.post(this.apiUrl, profile);
  }

  resetUserProfile(profile: any, p0: {}) {
    return this.http.put(this.apiUrl + "/reset", profile);
  }
}