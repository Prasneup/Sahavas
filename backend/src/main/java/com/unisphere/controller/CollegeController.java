package com.unisphere.controller;

import com.unisphere.model.College;
import com.unisphere.repository.CollegeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/colleges")
@RequiredArgsConstructor
public class CollegeController {

    private final CollegeRepository collegeRepository;

    @GetMapping
    public ResponseEntity<List<College>> getAllColleges() {
        return ResponseEntity.ok(collegeRepository.findAll());
    }
}
