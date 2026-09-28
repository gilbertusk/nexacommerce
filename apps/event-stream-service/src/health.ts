import { setDependencyReady } from '@nexacommerce/common';

const state = {
  kafka: false,
  rabbitmq: false,
};

export function setKafkaReady(ready: boolean): void {
  state.kafka = ready;
  setDependencyReady('kafka', ready);
}

export function setRabbitReady(ready: boolean): void {
  state.rabbitmq = ready;
  setDependencyReady('rabbitmq', ready);
}

export function getReadiness() {
  return {
    ready: state.kafka && state.rabbitmq,
    dependencies: { ...state },
  };
}
