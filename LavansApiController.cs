using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using LavansApi.Data;
using LavansApi.Services;

namespace LavansApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LavansController : ControllerBase
    {
        private readonly LavansApi.Services.LavansDatabaseService _service;

        public LavansController(LavansApi.Services.LavansDatabaseService service)
        {
            _service = service;
        }

        // GET: api/lavans/klanten
        [HttpGet("klanten")]
        public ActionResult<List<Klant>> GetKlanten()
        {
            try
            {
                var klanten = _service.GetKlanten();
                return Ok(klanten);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Fout bij ophalen klanten", details = ex.Message });
            }
        }

        // GET: api/lavans/klanten/{relatienummer}
        [HttpGet("klanten/{relatienummer}")]
        public ActionResult<Klant> GetKlant(string relatienummer)
        {
            try
            {
                var klant = _service.GetKlant(relatienummer);
                if (klant == null)
                    return NotFound(new { error = "Klant niet gevonden" });

                return Ok(klant);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Fout bij ophalen klant", details = ex.Message });
            }
        }

        // GET: api/lavans/klanten/{relatienummer}/abonnementen
        [HttpGet("klanten/{relatienummer}/abonnementen")]
        public ActionResult<List<Abonnement>> GetAbonnementen(string relatienummer)
        {
            try
            {
                var abonnementen = _service.GetAbonnementen(relatienummer);
                return Ok(abonnementen);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Fout bij ophalen abonnementen", details = ex.Message });
            }
        }

        // GET: api/lavans/klanten/{relatienummer}/contactpersonen
        [HttpGet("klanten/{relatienummer}/contactpersonen")]
        public ActionResult<List<Contactpersoon>> GetContactpersonen(string relatienummer)
        {
            try
            {
                var contactpersonen = _service.GetContactpersonen(relatienummer);
                return Ok(contactpersonen);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Fout bij ophalen contactpersonen", details = ex.Message });
            }
        }

        // POST: api/lavans/inspecties
        [HttpPost("inspecties")]
        public ActionResult<Inspectie> CreateInspectie([FromBody] Inspectie inspectie)
        {
            try
            {
                if (inspectie == null)
                    return BadRequest(new { error = "Inspectie data is verplicht" });

                if (string.IsNullOrEmpty(inspectie.KlantRelatienummer))
                    return BadRequest(new { error = "Klant relatienummer is verplicht" });

                var opgeslagenInspectieId = _service.SaveInspectie(inspectie);
                return CreatedAtAction(nameof(GetInspectie), new { id = opgeslagenInspectieId }, new { id = opgeslagenInspectieId });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Fout bij opslaan inspectie", details = ex.Message });
            }
        }

        // GET: api/lavans/inspecties
        [HttpGet("inspecties")]
        public ActionResult<List<Inspectie>> GetInspecties([FromQuery] string klantRelatienummer = null)
        {
            try
            {
                var inspecties = _service.GetInspecties(klantRelatienummer);
                return Ok(inspecties);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Fout bij ophalen inspecties", details = ex.Message });
            }
        }

        // GET: api/lavans/inspecties/{id}
        [HttpGet("inspecties/{id}")]
        public ActionResult<Inspectie> GetInspectie(string id)
        {
            try
            {
                var inspecties = _service.GetInspecties();
                var inspectie = inspecties.FirstOrDefault(i => i.Id == id);
                
                if (inspectie == null)
                    return NotFound(new { error = "Inspectie niet gevonden" });

                return Ok(inspectie);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Fout bij ophalen inspectie", details = ex.Message });
            }
        }

        // GET: api/lavans/leeftijd/{barcode}
        [HttpGet("leeftijd/{barcode}")]
        public ActionResult<object> BerekenLeeftijd(string barcode)
        {
            try
            {
                var leeftijd = _service.BerekenLeeftijd(barcode);
                return Ok(new { barcode, leeftijd });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Fout bij berekenen leeftijd", details = ex.Message });
            }
        }

        // GET: api/lavans/rapportage/{klantRelatienummer}
        [HttpGet("rapportage/{klantRelatienummer}")]
        public ActionResult<object> GetRapportage(
            string klantRelatienummer, 
            [FromQuery] DateTime startDatum, 
            [FromQuery] DateTime eindDatum)
        {
            try
            {
                var rapportage = _service.GetRapportage(klantRelatienummer, startDatum, eindDatum);
                return Ok(rapportage);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Fout bij genereren rapportage", details = ex.Message });
            }
        }

        // PUT: api/lavans/todo/{id}
        [HttpPut("todo/{id}")]
        public ActionResult<TodoItem> UpdateTodo(string id, [FromBody] TodoUpdateRequest request)
        {
            try
            {
                var updatedTodo = _service.UpdateTodo(id, request.Done, request.Text);
                if (updatedTodo == null)
                    return NotFound(new { error = "Todo item niet gevonden" });

                return Ok(updatedTodo);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Fout bij updaten todo", details = ex.Message });
            }
        }
    }

    public class TodoUpdateRequest
    {
        public bool Done { get; set; }
        public string? Text { get; set; }
    }


} 