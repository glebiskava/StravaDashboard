import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-profile.component.html',
})
export class UserProfileComponent implements OnInit {
  profile = {
    name: '',
    age: 0,
    height: 0,
    weight: 0
  };

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.userService.getUserProfile().subscribe((data: { name: string; age: number; height: number; weight: number; }) => {
      this.profile = data;
    });
  }

  saveProfile() {
    this.userService.updateUserProfile(this.profile).subscribe(() => {
      alert('Profile updated!');
    });
  }
}
