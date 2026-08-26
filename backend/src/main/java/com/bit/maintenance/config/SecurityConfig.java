package com.bit.maintenance.config;

import com.bit.maintenance.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final UserDetailsService userDetailsService;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        // Covers Vite's default dev port (5173) and any other localhost port.
        // Add your deployed frontend's origin here once you deploy (Phase 8).
        config.setAllowedOriginPatterns(List.of("http://localhost:*"));
        // PATCH is required - the frontend uses it for status/assign/profile updates.
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/register", "/api/auth/login", "/api/auth/logout").permitAll()
                        .requestMatchers("/uploads/**").permitAll()
                        .requestMatchers("/api/auth/admin/**").hasRole("ADMIN")

                        // Complaints - order matters: specific paths before the general rule
                        .requestMatchers(HttpMethod.GET, "/api/complaints/my-tasks").hasRole("TECHNICIAN")
                        .requestMatchers(HttpMethod.GET, "/api/complaints/my").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/complaints").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/complaints/*/status").hasRole("TECHNICIAN")
                        .requestMatchers(HttpMethod.PATCH, "/api/complaints/*/assign").hasRole("ADMIN")

                        // Technicians - admin manages the roster
                        .requestMatchers(HttpMethod.GET, "/api/technicians").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/technicians").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/technicians/**").hasRole("ADMIN")

                        // Users - admin searches, anyone edits their own profile
                        .requestMatchers(HttpMethod.GET, "/api/users/search").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/users/me").authenticated()

                        .requestMatchers("/api/dashboard/**").hasRole("ADMIN")
                        .anyRequest().authenticated()
                )
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
