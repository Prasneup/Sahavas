package com.unisphere.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "colleges")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class College {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotBlank(message = "College name is required")
    @Column(unique = true, nullable = false, length = 150)
    private String name;

    @NotBlank(message = "City is required")
    @Column(nullable = false, length = 50)
    private String city;

    @NotBlank(message = "Address is required")
    @Column(nullable = false, length = 255)
    private String address;
}
