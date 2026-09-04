Bolao.Regulation = {
  render() {
    Bolao.App.content(`
      <h1>Regulamento</h1>
      <div class="card regulation-text">
        <h2>Inscrição e premiação</h2>

        <p><strong>Art. 2º</strong> O valor da inscrição é de R$ 100,00 por participante.</p>
        <p><strong>§ 1º</strong> O participante que, ao final do bolão, tiver somado o menor número de pontos pagará multa adicional de R$ 10,00.</p>

        <p><strong>Art. 3º</strong> O valor integral de cada inscrição terá a seguinte destinação:</p>
        <ul>
          <li>R$ 50,00 para a premiação final do bolão;</li>
          <li>R$ 10,00 para a premiação do maior pontuador acumulado nos jogos dos playoffs;</li>
          <li>R$ 20,00 para a premiação do maior pontuador acumulado nos jogos da temporada regular;</li>
          <li>R$ 20,00 para a premiação dos maiores pontuadores de cada uma das 21 rodadas premiadas.</li>
        </ul>

        <p><strong>§ 1º</strong> As 21 rodadas premiadas são formadas pelas 18 rodadas da temporada regular e pelas três primeiras fases dos playoffs: Wild Card, Divisional e Finais de Conferência.</p>
        <p><strong>§ 2º</strong> O fundo de R$ 20,00 por participante destinado às rodadas será dividido igualmente entre as 21 rodadas premiadas.</p>
        <p><strong>§ 3º</strong> O valor do prêmio de cada rodada será calculado pela fórmula: número de participantes ativos multiplicado por R$ 20,00, dividido por 21.</p>
        <p><strong>§ 4º</strong> O Super Bowl contará para a pontuação geral e para a apuração do maior pontuador acumulado dos playoffs, mas não terá prêmio específico de maior pontuador da rodada.</p>
        <p><strong>§ 5º</strong> O Pro Bowl não integra o bolão e não gera pontuação ou premiação.</p>

        <p><strong>Art. 4º</strong> O fundo da premiação final será constituído por R$ 50,00 de cada inscrição.</p>
        <p><strong>§ 1º</strong> Com até dez participantes, 100% da premiação final será destinada ao primeiro colocado.</p>
        <p><strong>§ 2º</strong> Com 11 a 20 participantes, 90% da premiação final será destinada ao primeiro colocado e 10% ao segundo colocado.</p>
        <p><strong>§ 3º</strong> Com mais de 20 participantes, 80% da premiação final será destinada ao primeiro colocado, 15% ao segundo colocado e 5% ao terceiro colocado.</p>
        <p><strong>§ 4º</strong> Considera-se vencedor do bolão o participante que, ao final, tiver somado o maior número de pontos.</p>

        <h2>Pontuação dos jogos</h2>
        <ul>
          <li>Temporada regular: 3 pontos pelo vencedor e 1 ponto pela dificuldade.</li>
          <li>Playoffs: 6 pontos pelo vencedor e 2 pontos pela dificuldade.</li>
          <li>A dificuldade somente pontua quando o vencedor também estiver correto.</li>
          <li>A ausência de palpite vale zero ponto.</li>
          <li>O fator de correção é aplicado conforme o percentual de participantes ativos que acertar o palpite.</li>
        </ul>
      </div>
    `);
  }
};
