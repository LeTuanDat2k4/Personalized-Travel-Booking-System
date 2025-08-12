package com.datltdev.TravelBookinng;

import com.datltdev.TravelBookinng.security.AuditorAwareImpl;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;
import org.springframework.context.annotation.Bean;
import org.springframework.data.domain.AuditorAware;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication(exclude = { SecurityAutoConfiguration.class })
@EnableJpaAuditing
public class TravelBookinngApplication extends SpringBootServletInitializer {
	@Override
	protected SpringApplicationBuilder configure(SpringApplicationBuilder application) {
		return application.sources(TravelBookinngApplication.class);
	}

	public static void main(String[] args) {
		SpringApplication.run(TravelBookinngApplication.class, args);
	}

//	@Bean
//	public AuditorAware<String> auditorProvider() {
//		return new AuditorAwareImpl();
//	}

}
