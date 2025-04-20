import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { UserService } from '../../services/user.service';
import { MatCardModule } from '@angular/material/card';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatCardModule, FormsModule, MatInputModule],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  profile = {
    name: '',
    age: 0,
    height: 0,
    weight: 0
  };

  constructor(private userService: UserService) {}
  isProfileLoaded = false;

  ngOnInit() {
    this.userService.getUserProfile().subscribe((data) => {
      this.profile = data;
      this.isProfileLoaded = true; 
    });
  }  

  saveProfile() {
    this.userService.updateUserProfile(this.profile).subscribe(() => {
      alert('Profile saved!');
    });
  }

  resetProfile() {
    this.userService.resetUserProfile('http://localhost:5000/user/reset', {}).subscribe(() => {
      alert('Profile reset!');
      this.profile = {
        name: '',
        age: 0,
        height: 0,
        weight: 0
      };
    });
  }
  
}
