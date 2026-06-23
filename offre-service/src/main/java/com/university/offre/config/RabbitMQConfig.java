package com.university.offre.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {
    
    public static final String OFFRE_EXCHANGE = "offre.exchange";
    public static final String OFFRE_CREATED_QUEUE = "offre.created.queue";
    public static final String OFFRE_CREATED_ROUTING_KEY = "offre.created";
    
    @Bean
    public Exchange offreExchange() {
        return new TopicExchange(OFFRE_EXCHANGE);
    }
    
    @Bean
    public Queue offreCreatedQueue() {
        return new Queue(OFFRE_CREATED_QUEUE, true);
    }
    
    @Bean
    public Binding offreCreatedBinding() {
        return BindingBuilder
            .bind(offreCreatedQueue())
            .to(offreExchange())
            .with(OFFRE_CREATED_ROUTING_KEY)
            .noargs();
    }
    
    @Bean
    public Jackson2JsonMessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }
    
    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(messageConverter());
        return template;
    }
}
